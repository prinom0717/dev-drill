import { getMarkConfig, updateMarkConfig } from "@/lib/master-drill-store";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";

export async function GET(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const config = await getMarkConfig(user.id);

  return Response.json({ config });
}

export async function PUT(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  const body = (await request.json().catch(() => null)) as
    | { markType1?: string; markType2?: string; markType3?: string; resetToDefaults?: boolean }
    | null;

  if (!body) {
    return Response.json({ message: "リクエストボディが必要です。" }, { status: 400 });
  }

  const config = await updateMarkConfig(user.id, body);

  return Response.json({ config });
}
