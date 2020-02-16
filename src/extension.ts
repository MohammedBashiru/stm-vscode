// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { STMPanel } from "./Manager";
import { STMConfig } from "./ConfigManager";
import { StmProvider, STMTreeItem } from "./stmMasterProvider";
import { StmWeeklyProvider, STMWeeklyTreeItem } from "./stmWeeklyProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "stm-vscode" is now active!');
  const stmTreeProvider = new StmProvider();
  vscode.window.registerTreeDataProvider("stmTreeView", stmTreeProvider);

  const stmWeeklyProvider = new StmWeeklyProvider();
  vscode.window.registerTreeDataProvider("stmTreeWeekly", stmWeeklyProvider);
  vscode.commands.registerCommand("stmTreeWeekly.refreshEntry", () =>
    stmWeeklyProvider.refresh()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.stmConfigureAuth", () => {
      vscode.window.showInformationMessage(
        "Welcome to Syncline Task Manager VSCode Extension"
      );
      STMConfig.createOrShow(context.extensionPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.stmAddTask", () => {
      STMPanel.createOrShow(context.extensionPath);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("stm.doRefactor", () => {
      if (STMPanel.currentPanel) {
        STMPanel.currentPanel.doRefactor();
      }
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(STMPanel.viewType, {
      async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
      ) {
        console.log(`Got state: ${state}`);
        STMPanel.revive(webviewPanel, context.extensionPath);
      }
    });
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
