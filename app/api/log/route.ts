export async function POST(req: Request) {
  const body = await req.json();
  console.log("🔥 iPhone からのログ:", body);
  return Response.json({ ok: true });
}
