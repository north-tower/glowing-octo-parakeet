import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/auth";
import {
  HomePlacementError,
  staffDeleteHomePlacement,
  staffPatchHomePlacement,
  staffPlacementToJson,
} from "@/lib/server/home-placements";
import { bearerUser, requireRole } from "@/lib/server/middleware";
import { staffHomePlacementPatch, uuid } from "@/lib/server/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteContext) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  if (!uuid.safeParse(rawId).success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = staffHomePlacementPatch.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const row = await staffPatchHomePlacement(
      rawId,
      {
        sortOrder: data.sortOrder,
        headline: data.headline,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        active: data.active,
        startsAt:
          data.startsAt === undefined
            ? undefined
            : data.startsAt
              ? new Date(data.startsAt)
              : null,
        endsAt:
          data.endsAt === undefined
            ? undefined
            : data.endsAt
              ? new Date(data.endsAt)
              : null,
      },
      user.id,
      clientIp(req),
    );
    return NextResponse.json(staffPlacementToJson(row));
  } catch (err) {
    if (err instanceof HomePlacementError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[PATCH /api/admin/home-placements/:id]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: RouteContext) {
  const user = bearerUser(req);
  if (!user || !requireRole(user, "admin")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await ctx.params;
  if (!uuid.safeParse(rawId).success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    await staffDeleteHomePlacement(rawId, user.id, clientIp(req));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof HomePlacementError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    console.error("[DELETE /api/admin/home-placements/:id]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}