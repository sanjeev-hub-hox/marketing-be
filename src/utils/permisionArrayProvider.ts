import { RequestMethod } from "@nestjs/common";

export const permissionArrayJson = {
    "Competency_Test": {
        "/competency-test/:competencyTestId/logs/list": {
            method: RequestMethod.GET,
            permission: "Competency_Test_Logs_List"
        },
        "/competency-test/:enquiryId": {
            method: RequestMethod.GET,
            permission: "Competency_Test_Fetch"
        },
        "/competency-test/:enquiryId/create": {
            method: RequestMethod.POST,
            permission: "Competency_Test_Create"
        },
        "/competency-test/:competencyTest/cancel": {
            method: RequestMethod.POST,
            permission: "Competency_Test_Cancel"
        },
        "/competency-test/:competencyTest/reschedule": {
            method: RequestMethod.POST,
            permission: "Competency_Test_Reschedule"
        }
    },
    "auth": {
        "/auth/route1": {
            method: RequestMethod.POST,
            permission: "Route1"
        },
    }
};

const permissionArrayFormat = (permissionJson) => {
    const resultArray = [];
    for (const moduleKey in permissionJson) {
        const routes = permissionJson[moduleKey];
        for (const pathKey in routes) {
            const route = routes[pathKey];
            resultArray.push({
                path: pathKey,
                method: route.method,
                grantedPermission: route.permission
            });
        }
    }
    return resultArray;
};

export const privateRoutes = permissionArrayFormat(permissionArrayJson);

const extractPermissions = (permissionJson) => {
    const permissionsArray = [];
    for (const moduleKey in permissionJson) {
        const routes = permissionJson[moduleKey];
        for (const pathKey in routes) {
            const route = routes[pathKey];
            permissionsArray.push(route.permission);
        }
    }
    return permissionsArray;
};

export const permissionsOnly = extractPermissions(permissionArrayJson);