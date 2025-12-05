import type { ComponentType, ReactNode } from "react";
import React, { useEffect, useState } from "react";
import type {
  DialogOpenerProps as PackageDialogOpenerProps,
  ApprovalWorkflowProps as PackageApprovalWorkflowProps,
} from "amp-workflow-ui";

type ApiClient = {
  get: (params: {
    url: string;
    serviceURL?: string;
    [key: string]: any;
  }) => Promise<any>;
  post: (params: {
    url: string;
    data?: any;
    serviceURL?: string;
    [key: string]: any;
  }) => Promise<any>;
};

export type DialogOpenerProps = PackageDialogOpenerProps & {
  api: ApiClient;
  urlBuilder?: (...args: any[]) => string;
  loadingComponent?: ReactNode;
  ENV_VARIABLES: any;
};

export const RemoteDialogOpener = ((props: DialogOpenerProps) => {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod: any = await import("amp-workflow-ui/dist/index.js");
      const C = mod.DialogOpener || mod.default?.DialogOpener || mod.default;
      console.log("REMOTE MOUNTED");
      if (mounted) setComp(() => C);
    })();
    
return () => {
      mounted = false;
    };
  }, []);
  if (!Comp) return <div>Loading Approval Management...</div>;
  
return <Comp {...props} />;
}) as ComponentType<DialogOpenerProps>;

export type ApprovalWorkflowProps = PackageApprovalWorkflowProps & {
  api: ApiClient;
  urlBuilder?: (...args: any[]) => string;
  loadingComponent?: ReactNode;
};

export const RemoteApprovalWorkflow = ((props: ApprovalWorkflowProps) => {
  const [Comp, setComp] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod: any = await import("amp-workflow-ui/dist/index.js");
      const C =
        mod.ApprovalWorkflow || mod.default?.ApprovalWorkflow || mod.default;
      if (mounted) setComp(() => C);
    })();
    
return () => {
      mounted = false;
    };
  }, []);
  if (!Comp) return <div>Loading Workflow...</div>;
  
return <Comp {...props} />;
}) as ComponentType<ApprovalWorkflowProps>;
