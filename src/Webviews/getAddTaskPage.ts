import * as vscode from "vscode";
import * as path from "path";
import { getNonce } from "../Helpers";

export const getAddTaskPage_html = (
  _extensionPath: string,
  webview: vscode.Webview
) => {
  const scriptPathOnDisk = vscode.Uri.file(
    path.join(_extensionPath, "media", "addTask.js")
  );

  const stylePathOnDisk = vscode.Uri.file(
    path.join(_extensionPath, "media", "style.css")
  );

  // And the uri we use to load this script in the webview
  const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
  // const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
  const styleUri = webview.asWebviewUri(stylePathOnDisk);

  // Use a nonce to whitelist which scripts can be run
  const nonce = getNonce();

  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src-elem ${webview.cspSource} https:; style-src-elem ${webview.cspSource} https:; font-src ${webview.cspSource} https:;">
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script
                src="https://kit.fontawesome.com/ba1b5d3d86.js"
                crossorigin="anonymous"
                ></script>
                <link
                href="https://fonts.googleapis.com/css?family=Montserrat&display=swap"
                rel="stylesheet"
                />
                <link rel="stylesheet" href="${styleUri}" />
                <title>Add Task</title>
            </head>

            <body>
                <div class="task-entry">
                    <h1 id="welcome">Add Task</h1>
                    <div class="task-wrapper">
                        <div class="task-header">
                            <p>Adding task made simple</p>
                            <div class="icon" title="Add More Task" id="addMore">
                                <span><i class="fa fa-plus-square"></i></span>
                            </div>
                        </div>
                        <div class="main-task">
                            <div class="icon">
                            <span><i class="fa fa-calendar-alt"></i></span>
                            </div>
                            <div class="form-control">
                                <input id="taskEntryDate" type="date" name="date"></input>
                            </div>
                        </div>
                        <div class="content">
                        <ul class="task-manager">
                            <li class="task">
                                <div class="icon">
                                    <span><i class="fa fa-trash-alt"></i></span>
                                </div>
                                <div class="input">
                                    <textarea name="taskfield" cols="30" rows="2" value=""></textarea>
                                </div>
                            </li>
                        </ul>
                        </div>
                        <div class="form-action">
                        <button type="button" id="createTask">Create Task</button>
                        </div>
                    </div>
                    <div class="loader hide"></div>
                    <div class="overlay hide"></div>
                </div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
};
