import { getStats } from "@/lib/master-drill-store";
import { requireAuth, isAuthError } from "@/lib/auth/require-auth";

export async function GET(request: Request) {
  // 認証チェック
  const authResult = await requireAuth(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  const user = authResult;

  return Response.json(await getStats(user.id));
}
