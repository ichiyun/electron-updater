import { HttpExecutor } from "electron-builder-http";
import { BintrayOptions } from "electron-builder-http/out/publishOptions";
import { VersionInfo } from "electron-builder-http/out/updateInfo";
import { FileInfo, Provider } from "./main";
export declare class BintrayProvider extends Provider<VersionInfo> {
    private client;
    setRequestHeaders(value: any): void;
    constructor(configuration: BintrayOptions, httpExecutor: HttpExecutor<any>);
    getLatestVersion(): Promise<VersionInfo>;
    getUpdateFile(versionInfo: VersionInfo): Promise<FileInfo>;
}
