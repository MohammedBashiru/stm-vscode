import * as vscode from "vscode";
import * as path from "path";
import { getNonce } from "../Helpers";

export const getAuthPage_html = (
  _extensionPath: string,
  webview: vscode.Webview
) => {
  const scriptPathOnDisk = vscode.Uri.file(
    path.join(_extensionPath, "media", "auth.js")
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
            <meta charset="UTF-8">
            <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="${styleUri}">
            <title>Save Authentication.</title>
        </head>
        <body>
            <div class="login-form">
                <h1 id="welcome">Syncline Task Manager</h1>
                <p>Enter your STM Credentials</p>
                <form action="" method="">
                    <div class="form-control">
                        <label for="username">Username</label>
                        <input id="username" type="string" name="username" value=""></input>
                    </div>
                    <div class="form-control">
                        <label for="username">Password</label>
                        <input id="password" type="password" name="password" value=""></input>
                    </div>
                    <div class="form-control">
                        <button type="button" id="saveCreds">Save</button>
                    </div>
                </form>
            </div>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
};
