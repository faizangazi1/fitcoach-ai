import { NextRequest } from "next/server";

export async function getCurrentUser(request: NextRequest) {
  return {
    id: 1,
    name: "Test User",
  };
}
