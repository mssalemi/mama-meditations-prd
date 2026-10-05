import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

// Issues a short-lived token so the BROWSER uploads straight to Blob.
//
// The file must not pass through this function: Vercel caps a serverless
// request body at 4.5MB, and any real meditation recording is bigger than that
// — a 5.8MB file returned 413 FUNCTION_PAYLOAD_TOO_LARGE. Direct upload has no
// such ceiling.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        // Middleware guards this path too; checking again means a matcher
        // mistake can't hand out upload tokens to strangers.
        if (!(await requireSession(req.cookies))) {
          throw new Error("Not authorized");
        }
        return {
          allowedContentTypes: [
            "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg",
            "audio/aac", "audio/x-m4a", "audio/mp4a-latm", "audio/x-caf",
            "audio/m4a", "audio/x-aac", "audio/webm",
          ],
          addRandomSuffix: true,
        };
      },
      // Metadata is written by the client once the upload resolves, so nothing
      // is needed here. (This callback never fires on localhost anyway.)
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[upload] token generation failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 400 },
    );
  }
}
