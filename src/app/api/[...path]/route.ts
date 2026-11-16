import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000/api";
const cookieName = "token";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

async function proxyRequest(
  request: NextRequest,
  context: RouteContext<"/api/[...path]">,
) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const cookieStore = await cookies();

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  }

  if (endpoint === "auth/logout") {
    if (request.method !== "POST") {
      return NextResponse.json(
        { message: "Method not allowed" },
        { status: 405 },
      );
    }
    cookieStore.delete(cookieName);
    return NextResponse.json({ success: true });
  }

  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("authorization");
  headers.delete("origin");

  const token = cookieStore.get(cookieName)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const upstream = await fetch(
    `${backendUrl}/${endpoint}${request.nextUrl.search}`,
    {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
    },
  );

  const responseHeaders = new Headers();
  responseHeaders.set("cache-control", "no-store");
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  if (upstream.status === 204) return new NextResponse(null, { status: 204 });

  let responseBody: BodyInit | null = upstream.body;
  let loginToken: string | undefined;
  if (endpoint === "auth/login" && upstream.ok) {
    const loginData = await upstream.json();
    loginToken = loginData.token;
    responseBody = JSON.stringify({ user: loginData.user });
    responseHeaders.set("content-type", "application/json");
  }

  const response = new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
  if (loginToken) response.cookies.set(cookieName, loginToken, cookieOptions);
  return response;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
