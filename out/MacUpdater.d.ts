import BluebirdPromise from "bluebird-lst";
import { CancellationToken } from "electron-builder-http";
import { PublishConfiguration } from "electron-builder-http/out/publishOptions";
import { VersionInfo } from "electron-builder-http/out/updateInfo";
import { AppUpdater } from "./AppUpdater";
import { FileInfo } from "./main";
export declare class MacUpdater extends AppUpdater {
    private readonly nativeUpdater;
    constructor(options?: PublishConfiguration);
    protected doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): BluebirdPromise<null>;
    private proxyUpdateFile(nativeResponse, fileInfo, cancellationToken, errorHandler);
    private doProxyUpdateFile(nativeResponse, parsedUrl, headers, sha512, cancellationToken, errorHandler);
    quitAndInstall(): void;
}
