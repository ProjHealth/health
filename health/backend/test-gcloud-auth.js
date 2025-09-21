import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

async function testAuth() {
  try {
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const projectId = await auth.getProjectId();

    console.log("✅ Authenticated with project:", projectId);
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
  }
}

testAuth();
