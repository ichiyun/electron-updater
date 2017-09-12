import { HttpExecutor } from "electron-builder-http";
import { GithubOptions } from "electron-builder-http/out/publishOptions";
import { UpdateInfo } from "electron-builder-http/out/updateInfo";
import { BaseGitHubProvider } from "./GitHubProvider";
import { FileInfo } from "./main";
export interface PrivateGitHubUpdateInfo extends UpdateInfo {
    assets: Array<Asset>;
}
export declare class PrivateGitHubProvider extends BaseGitHubProvider<PrivateGitHubUpdateInfo> {
    private readonly token;
    private readonly executor;
    private readonly netSession;
    constructor(options: GithubOptions, token: string, executor: HttpExecutor<any>);
    getLatestVersion(): Promise<PrivateGitHubUpdateInfo>;
    private registerHeaderRemovalListener();
    private configureHeaders(accept);
    private getLatestVersionInfo(basePath, cancellationToken);
    private readonly basePath;
    getUpdateFile(versionInfo: PrivateGitHubUpdateInfo): Promise<FileInfo>;
}
export interface Asset {
    name: string;
    url: string;
}
