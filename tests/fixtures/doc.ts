// Copyright © 2023 Tomoki Miyauchi. All rights reserved. MIT license.
// This module is browser compatible.

export declare const req: Request;
export declare const res: Response & { hasRetried: boolean } & {
  destination: string;
};
export declare const retry: (request: Request) => void;
export declare const handleData: (
  body: BodyInit | null,
  rest: Omit<Response, "status" | "body">,
) => void;
export declare const handleRedirect: (url: string) => void;
export declare const throwSomething: () => never;
