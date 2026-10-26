function handler(event) {
    // "/media/abc.webp" -> "/abc.webp"; bucket keys live at the root.
    var uri = event.request.uri.replace(/^\/[^\/]+/, '') || '/';
    // Raw uploads awaiting transcode aren't meant to be public.
    if (uri.indexOf('/transcode_in/') === 0) {
        return { statusCode: 404, statusDescription: 'Not Found' };
    }
    event.request.uri = uri;
    return event.request;
}
