import { CancellationToken, DownloadOptions, HttpExecutor, RequestOptionsEx } from "electron-builder-http";
export declare const NET_SESSION_NAME = "electron-updater";
export declare type LoginCallback = (username: string, password: string) => void;
export declare class ElectronHttpExecutor extends HttpExecutor<Electron.ClientRequest> {
    private proxyLoginCallback;
    constructor(proxyLoginCallback?: ((authInfo: any, callback: LoginCallback) => void) | undefined);
    download(url: string, destination: string, options: DownloadOptions): Promise<string>;
    doApiRequest<T>(options: RequestOptionsEx, cancellationToken: CancellationToken, requestProcessor: (request: Electron.ClientRequest, reject: (error: Error) => void) => void, redirectCount?: number): Promise<T>;
    doRequest(options: any, callback: (response: any) => void): any;
    private addProxyLoginHandler(request);
}
