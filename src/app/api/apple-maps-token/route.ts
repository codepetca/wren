import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

// Cache token to avoid regenerating on every request
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function GET() {
  try {
    const teamId = process.env.APPLE_MAPS_TEAM_ID;
    const keyId = process.env.APPLE_MAPS_KEY_ID;
    const privateKey = process.env.APPLE_MAPS_PRIVATE_KEY;

    if (!teamId || !keyId || !privateKey) {
      return NextResponse.json(
        { error: "Apple Maps credentials not configured" },
        { status: 500 }
      );
    }

    // Return cached token if still valid (with 5 min buffer)
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && cachedToken.expiresAt > now + 300) {
      return NextResponse.json({ token: cachedToken.token });
    }

    // Token expires in 1 hour
    const expiresAt = now + 3600;

    // Import the private key (handle both formats)
    const keyContent = privateKey.includes("-----BEGIN PRIVATE KEY-----")
      ? privateKey
      : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

    const key = await importPKCS8(keyContent, "ES256");

    // Create and sign the JWT
    const token = await new SignJWT({})
      .setProtectedHeader({
        alg: "ES256",
        kid: keyId,
        typ: "JWT",
      })
      .setIssuer(teamId)
      .setIssuedAt(now)
      .setExpirationTime(expiresAt)
      .sign(key);

    // Cache the token
    cachedToken = { token, expiresAt };

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to generate Apple Maps token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
