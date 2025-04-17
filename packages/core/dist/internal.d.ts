interface WebsiteToExtension {
    requestHosts: (data: {
        hosts: string[];
    }) => 'accept' | 'reject';
    getAllowedInfo: () => {
        enabled: boolean;
        type: 'all' | 'specific';
        hosts?: string[];
    };
    request: (req: any) => any;
}
export declare const internalMessaging: import('@webext-core/messaging/page').WindowMessenger<WebsiteToExtension>;
export {};
//# sourceMappingURL=internal.d.ts.map