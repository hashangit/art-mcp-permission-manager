export declare function getAllowedInfo(): Promise<{
    enabled: boolean;
    type: "all" | "specific";
    hosts?: string[];
}>;
export declare function requestHosts(data: {
    hosts: string[];
}): Promise<"accept" | "reject">;
export declare function hasInstall(): string | undefined;
export declare function install(): void;
//# sourceMappingURL=index.d.ts.map