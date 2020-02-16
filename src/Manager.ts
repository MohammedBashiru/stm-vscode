import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
const userHomeDir = require("os").homedir();
import { API_URL } from "./config";

import { getAuthPage_html } from "./Webviews/getAuthPage";
import { getAddTaskPage_html } from "./Webviews/getAddTaskPage";

/**
 * Manage STM WebView
 */
export class STMPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: STMPanel | undefined;

  public static readonly viewType = "stmTaskManager";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  private _userCreds: any;

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;

    // Set the webview's initial html content
    this.initApp();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        console.log("panel did change view state");
        if (this._panel.visible) {
          this._getAuthLoginWebView();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        console.log("did receive message", message);
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
          case "saveAuth":
            fs.writeFile(
              `${userHomeDir}/.stm-config.json`,
              message.data,
              "utf8",
              err => {
                if (err) {
                  console.error(err.message);
                  vscode.window.showErrorMessage(
                    "There was an issue saving your info"
                  );
                } else {
                  vscode.window.showInformationMessage(
                    "Account settings saved. You can now add and view your tasks"
                  );
                }
              }
            );
            return;
          case "saveTask":
            this.createTask(JSON.parse(message.data));
            return;
        }
      },
      null,
      this._disposables
    );
  }

  private createTask(taskData: any) {
    return new Promise(resolve => {
      const requestData = {
        ...taskData
      };
      const requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Basic ${this._userCreds["username"]}:${this._userCreds["password"]}`
      };

      axios
        .post(API_URL, requestData, {
          headers: requestHeaders
        })
        .then(res => {
          this._panel.webview.postMessage({ command: "success" });
          vscode.window.showInformationMessage("Task Created Successful");
          resolve(res.data);
        })
        .catch(err => {
          console.log("request failed", err);
          vscode.window.showErrorMessage(
            "There was an issue creating your task."
          );
          this._panel.webview.postMessage({ command: "error" });
        });
    });
  }

  private initApp() {
    fs.readFile(`${userHomeDir}/.stm-config.json`, "utf8", err => {
      if (err) {
        console.error(err.message);
        this._getAuthLoginWebView();
      } else {
        // User info exists but verify its correct
        fs.readFile(
          `${userHomeDir}/.stm-config.json`,
          "utf8",
          (error, data) => {
            const userInfo = JSON.parse(data);
            if (userInfo["username"] && userInfo["password"]) {
              // Send User to Add Task
              this._userCreds = userInfo;
              const statusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Right,
                1000
              );
              statusBarItem.text = `$(tasklist) Task Manager: ${userInfo["username"]}`;
              statusBarItem.command = "extension.stmAddTask";
              statusBarItem.show();
              this._getAddTaskWebView();
            } else {
              // Info exists but not valid.
              this._getAuthLoginWebView();
            }
          }
        );
      }
    });
  }

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (STMPanel.currentPanel) {
      STMPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      STMPanel.viewType,
      "STM Task Manager",
      column || vscode.ViewColumn.One,
      {
        enableCommandUris: true,
        // Enable javascript in the webview
        enableScripts: true,
        retainContextWhenHidden: true,
        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.file(path.join(extensionPath, "media"))]
      }
    );

    STMPanel.currentPanel = new STMPanel(panel, extensionPath);
  }

  private _getAuthLoginWebView() {
    this._panel.title = "Password Authentication";
    this._panel.webview.html = getAuthPage_html(
      this._extensionPath,
      this._panel.webview
    );
  }

  private _getAddTaskWebView() {
    this._panel.title = "Add Task";
    this._panel.webview.html = getAddTaskPage_html(
      this._extensionPath,
      this._panel.webview
    );
  }

  public doRefactor() {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ command: "refactor" });
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    STMPanel.currentPanel = new STMPanel(panel, extensionPath);
  }

  public dispose() {
    STMPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
