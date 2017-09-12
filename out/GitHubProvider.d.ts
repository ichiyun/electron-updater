/// <reference types="node" />
import { HttpExecutor } from "electron-builder-http";
import { GithubOptions } from "electron-builder-http/out/publishOptions";
import { UpdateInfo } from "electron-builder-http/out/updateInfo";
import { RequestOptions } from "http";
import { AppUpdater } from "./AppUpdater";
import { FileInfo, Provider } from "./main";
export declare abstract class BaseGitHubProvider<T extends UpdateInfo> extends Provider<T> {
    protected readonly options: GithubOptions;
    protected readonly baseUrl: RequestOptions;
    constructor(options: GithubOptions, baseHost: string);
}
export declare class GitHubProvider extends BaseGitHubProvider<UpdateInfo> {
    protected readonly options: GithubOptions;
    private readonly updater;
    private readonly executor;
    constructor(options: GithubOptions, updater: AppUpdater, executor: HttpExecutor<any>);
    getLatestVersion(): Promise<UpdateInfo>;
    private getLatestVersionString(basePath, cancellationToken);
    private readonly basePath;
    getUpdateFile(versionInfo: UpdateInfo): Promise<FileInfo>;
    private getBaseDownloadPath(version, fileName);
}
