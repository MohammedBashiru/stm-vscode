import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
const userHomeDir = require("os").homedir();

import { getAuthPage_html } from "./Webviews/getAuthPage";

/**
 * Manage STM WebView
 */
export class STMConfig {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: STMConfig | undefined;

  public static readonly viewType = "stmTaskConfig";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    this._panel = panel;
    this._extensionPath = extensionPath;
    this.initApp();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._getAuthLoginWebView();
        }
      },
      null,
      this._disposables
    );

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
        }
      },
      null,
      this._disposables
    );
  }

  private initApp() {
    this._getAuthLoginWebView();
  }

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (STMConfig.currentPanel) {
      STMConfig.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      STMConfig.viewType,
      "STM Task Auth",
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

    STMConfig.currentPanel = new STMConfig(panel, extensionPath);
  }

  private _getAuthLoginWebView() {
    this._panel.title = "Password Authentication";
    this._panel.webview.html = getAuthPage_html(
      this._extensionPath,
      this._panel.webview
    );
  }
  public dispose() {
    STMConfig.currentPanel = undefined;

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
