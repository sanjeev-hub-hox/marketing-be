import { applyDecorators } from "@nestjs/common"
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiQueryOptions,
    ApiParamOptions,
    ApiResponseMetadata,
    ApiQuery,
    ApiParam,
    ApiNotFoundResponse
} from "@nestjs/swagger";

export enum ESwaggerDecorators {
    OK_RESPONSE = 'ApiOkResponse',
    BAD_REQUEST_RESPONSE = 'ApiBadRequestResponse',
    CREATED_RESPONSE = 'ApiCreatedResponse',
    NOT_FOUND = 'ApiNotFoundResponse'
}

export type TSwaggerResponseOptions = Record<ESwaggerDecorators, ApiResponseMetadata>;
export type TSwaggerOptions = {
    response: TSwaggerResponseOptions,
    query?: ApiQueryOptions[],
    params?: ApiParamOptions[]
};


export function Swagger(parameter: TSwaggerOptions) {
    const swaggerDecorators = [];

    Object.keys(parameter.response).forEach(decoratorName => {
        switch (decoratorName) {
            case ESwaggerDecorators.CREATED_RESPONSE:
                swaggerDecorators.push(
                    ApiCreatedResponse({
                        status: parameter.response[decoratorName].status,
                        description: parameter.response[decoratorName].description ?? 'Success response',
                        type: parameter.response[decoratorName].type
                    })
                )
                break;
            case ESwaggerDecorators.OK_RESPONSE:
                swaggerDecorators.push(
                    ApiOkResponse({
                        status: parameter.response[decoratorName].status,
                        description: parameter.response[decoratorName].description ?? 'Success response',
                        type: parameter.response[decoratorName].type
                    })
                )
                break;
            case ESwaggerDecorators.BAD_REQUEST_RESPONSE:
                swaggerDecorators.push(
                    ApiBadRequestResponse({
                        status: parameter.response[decoratorName].status,
                        description: parameter.response[decoratorName].description ?? 'Validation error response',
                        type: parameter.response[decoratorName].type
                    })
                )
                break;
            case ESwaggerDecorators.NOT_FOUND:
                swaggerDecorators.push(
                    ApiNotFoundResponse({
                        status: parameter.response[decoratorName].status,
                        description: parameter.response[decoratorName].description ?? 'Failure response',
                        type: parameter.response[decoratorName].type
                    })
                )
                break;
        }
    })

    if (parameter.query) {
        parameter.query.forEach(queryConfig => {
            swaggerDecorators.push(ApiQuery(queryConfig))
        })
    }

    if (parameter.params) {
        parameter.params.forEach(paramConfig => {
            swaggerDecorators.push(ApiParam(paramConfig))
        })
    }

    return applyDecorators(...swaggerDecorators)
}