import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class StmProvider implements vscode.TreeDataProvider<STMTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    STMTreeItem | undefined
  > = new vscode.EventEmitter<STMTreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<STMTreeItem | undefined> = this
    ._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: STMTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: STMTreeItem): Thenable<STMTreeItem[]> {
    const children: STMTreeItem[] = [
      new STMTreeItem(
        "Configure Auth",
        vscode.TreeItemCollapsibleState.None,
        "configure",
        {
          command: "extension.stmConfigureAuth",
          title: "Configure Task Auth"
        }
      ),
      new STMTreeItem("Add Task", vscode.TreeItemCollapsibleState.None, "add", {
        command: "extension.stmAddTask",
        title: "Add New Task"
      })
    ];

    return Promise.resolve(children);
  }
}

export class STMTreeItem extends vscode.TreeItem {
  constructor(
    public readonly title: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly iconName: string,
    public readonly command?: vscode.Command,
    public readonly info?: string
  ) {
    super(title, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}`;
  }

  get description(): string | undefined {
    return this.info;
  }

  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "media",
      "light",
      `${this.iconName}.png`
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "media",
      "dark",
      `${this.iconName}.png`
    )
  };

  contextValue = "stmtreeview";
}
