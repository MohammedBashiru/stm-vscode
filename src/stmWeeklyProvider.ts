import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
const userHomeDir = require("os").homedir();
import { format } from "date-fns";
import { API_URL } from "./config";

export class StmWeeklyProvider
  implements vscode.TreeDataProvider<STMWeeklyTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    STMWeeklyTreeItem | undefined
  > = new vscode.EventEmitter<STMWeeklyTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<
    STMWeeklyTreeItem | undefined
  > = this._onDidChangeTreeData.event;
  private _userCreds: any;

  constructor() {}

  refresh(): void {
    console.log("refresh called");
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: STMWeeklyTreeItem): vscode.TreeItem {
    return element;
  }

  getUserCreds(): any {
    return this._userCreds;
  }

  getChildren(element?: STMWeeklyTreeItem): Thenable<STMWeeklyTreeItem[]> {
    console.log("get children weekly");
    return new Promise(resolve => {
      fs.readFile(`${userHomeDir}/.stm-config.json`, "utf8", err => {
        if (err) {
          vscode.window.showInformationMessage(
            "Configure your account to view weekly task"
          );
          resolve([]);
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
                  undefined,
                  1000
                );

                statusBarItem.text = `$(tasklist) Task Manager: ${userInfo["username"]}`;
                statusBarItem.command = "extension.stmAddTask";
                statusBarItem.show();

                if (userInfo["username"] && userInfo["password"]) {
                  console.log("making request because user has info");
                  const requestData = {
                    action: 114
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
                      const tasks = res.data;
                      resolve(
                        tasks.map(
                          (task: any) =>
                            new STMWeeklyTreeItem(
                              `${format(
                                new Date(task.created_on),
                                "ddd do MMM"
                              )}: ${task.task}`,
                              0,
                              task.task
                            )
                        )
                      );
                    })
                    .catch(err => {
                      console.log("request failed", err);
                      vscode.window.showErrorMessage(
                        "There was an issue getting your weekly task."
                      );
                      resolve([]);
                    });
                } else {
                  console.log("no request");
                  resolve([]);
                }
              } else {
                vscode.window.showInformationMessage(
                  "Configure your account to view weekly task"
                );
                resolve([]);
              }
            }
          );
        }
      });
    });
  }
}

export class STMWeeklyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly task: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly info?: string,
    public readonly command?: vscode.Command
  ) {
    super(task, collapsibleState);
  }

  get tooltip(): string {
    return `${this.info}`;
  }

  get description(): string | undefined {
    return this.info;
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "media", "light", "tick.png"),
    dark: path.join(__filename, "..", "..", "media", "dark", "tick.png")
  };

  contextValue = "stmtreeweekly";
}
