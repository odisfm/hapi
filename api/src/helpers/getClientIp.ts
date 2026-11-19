import { getConnInfo as getConnInfoLambda } from '@hono/aws-lambda'
import { getConnInfo as getConnInfoNode } from '@hono/node-server/conninfo'
import type {Context} from "hono";

/**
 * The visitor's IP address, used to count each visitor's views once a day.
 *
 * In production the API's direct client is a CloudFront edge server, shared by many
 * visitors. CloudFront passes the visitor's address on in `CloudFront-Viewer-Address`,
 * as "<ip>:<port>" (IPv6 without brackets). CloudFront sets that header itself, so a
 * visitor going through CloudFront can't fake it. Someone calling the API Gateway URL
 * directly could, which at worst inflates view counts.
 *
 * Locally, and if the header is missing, it falls back to the connection's address.
 */
export function getClientIp(c: Context): string | undefined {
    const viewerAddress = c.req.header("cloudfront-viewer-address")
    if (viewerAddress) {
        const portSeparator = viewerAddress.lastIndexOf(":")
        if (portSeparator > 0) {
            return viewerAddress.slice(0, portSeparator)
        }
    }
    if (c.env?.event?.requestContext) {
        return getConnInfoLambda(c).remote.address
    }
    return getConnInfoNode(c).remote.address
}
