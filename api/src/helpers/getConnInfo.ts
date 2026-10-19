import { getConnInfo as getConnInfoLambda } from '@hono/aws-lambda'
import { getConnInfo as getConnInfoNode } from '@hono/node-server/conninfo'
import {Context} from "hono";

export function getConnInfo(c: Context) {
    if (c.env?.event?.requestContext) {
        return getConnInfoLambda(c)
    }
    return getConnInfoNode(c)
}
