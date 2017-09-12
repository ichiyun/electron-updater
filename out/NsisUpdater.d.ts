import { CancellationToken } from "electron-builder-http";
import { PublishConfiguration } from "electron-builder-http/out/publishOptions";
import { VersionInfo } from "electron-builder-http/out/updateInfo";
import "source-map-support/register";
import { AppUpdater } from "./AppUpdater";
import { FileInfo } from "./main";
export declare class NsisUpdater extends AppUpdater {
    private readonly downloadedUpdateHelper;
    private quitAndInstallCalled;
    private quitHandlerAdded;
    constructor(options?: PublishConfiguration | null, app?: any);
    /*** @private */
    protected doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): Promise<string>;
    private verifySignature(tempUpdateFile);
    private addQuitHandler();
    quitAndInstall(isSilent?: boolean, isForceRunAfter?: boolean): void;
    private install(isSilent, isForceRunAfter);
}
