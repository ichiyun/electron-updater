/// <reference types="node" />
import { CancellationToken, ProgressInfo, RequestHeaders } from "electron-builder-http";
import { UpdateInfo, VersionInfo } from "electron-builder-http/out/updateInfo";
import { EventEmitter } from "events";
import { Url } from "url";
import { AppUpdater } from "./AppUpdater";
import { LoginCallback } from "./electronHttpExecutor";
export { NET_SESSION_NAME } from "./electronHttpExecutor";
export { AppUpdater } from "./AppUpdater";
export declare const autoUpdater: AppUpdater;
export interface FileInfo {
    readonly name: string;
    readonly url: string;
    readonly sha2?: string;
    readonly sha512?: string;
    readonly headers?: RequestHeaders;
}
export declare abstract class Provider<T extends VersionInfo> {
    protected requestHeaders: RequestHeaders | null;
    setRequestHeaders(value: RequestHeaders | null): void;
    abstract getLatestVersion(): Promise<T>;
    abstract getUpdateFile(versionInfo: T): Promise<FileInfo>;
    static validateUpdateInfo(info: UpdateInfo): void;
}
export declare function getDefaultChannelName(): string;
export declare function getCustomChannelName(channel: string): string;
export declare function getCurrentPlatform(): string;
export declare function isUseOldMacProvider(): boolean;
export declare function getChannelFilename(channel: string): string;
export interface UpdateCheckResult {
    readonly versionInfo: VersionInfo;
    readonly fileInfo?: FileInfo;
    readonly downloadPromise?: Promise<any> | null;
    readonly cancellationToken?: CancellationToken;
}
export declare const DOWNLOAD_PROGRESS = "download-progress";
export declare const UPDATE_DOWNLOADED = "update-downloaded";
export declare type LoginHandler = (authInfo: any, callback: LoginCallback) => void;
export declare class UpdaterSignal {
    private emitter;
    constructor(emitter: EventEmitter);
    /**
     * Emitted when an authenticating proxy is asking for user credentials.
     * @see [Electron docs](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login)
     */
    login(handler: LoginHandler): void;
    progress(handler: (info: ProgressInfo) => void): void;
    updateDownloaded(handler: (info: VersionInfo) => void): void;
    updateCancelled(handler: (info: VersionInfo) => void): void;
}
export declare function formatUrl(url: Url): string;
export interface Logger {
    info(message?: any): void;
    warn(message?: any): void;
    error(message?: any): void;
}
