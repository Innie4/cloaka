import { lookup } from "node:dns/promises";
import Redis from "ioredis";
import { env } from "../config/env";
import { prisma } from "../config/database";

type IntegrationStatus = {
  name: string;
  configured: boolean;
  reachable: boolean;
  details: string;
};

type DnsHostCheck = {
  reachable: boolean;
  hasIpv4: boolean;
  hasIpv6: boolean;
};

async function checkDnsHost(hostname: string): Promise<DnsHostCheck> {
  const result: DnsHostCheck = {
    reachable: false,
    hasIpv4: false,
    hasIpv6: false
  };

  try {
    await lookup(hostname);
    result.reachable = true;
  } catch {
    return result;
  }

  try {
    await lookup(hostname, {
      family: 4
    });
    result.hasIpv4 = true;
  } catch {
    result.hasIpv4 = false;
  }

  try {
    await lookup(hostname, {
      family: 6
    });
    result.hasIpv6 = true;
  } catch {
    result.hasIpv6 = false;
  }

  return result;
}

async function checkPaystack(): Promise<IntegrationStatus> {
  if (!env.PAYSTACK_SECRET_KEY) {
    return {
      name: "paystack",
      configured: false,
      reachable: false,
      details: "Secret key not configured."
    };
  }

  try {
    const response = await fetch("https://api.paystack.co/bank?country=nigeria", {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
      }
    });

    return {
      name: "paystack",
      configured: true,
      reachable: response.ok,
      details: response.ok ? "Authenticated request succeeded." : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      name: "paystack",
      configured: true,
      reachable: false,
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function checkFlutterwave(): Promise<IntegrationStatus> {
  if (!env.FLUTTERWAVE_SECRET_KEY) {
    return {
      name: "flutterwave",
      configured: false,
      reachable: false,
      details: "Secret key not configured."
    };
  }

  try {
    const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      headers: {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`
      }
    });

    return {
      name: "flutterwave",
      configured: true,
      reachable: response.ok,
      details: response.ok ? "Authenticated request succeeded." : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      name: "flutterwave",
      configured: true,
      reachable: false,
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function checkRedis(): Promise<IntegrationStatus> {
  if (!env.REDIS_URL) {
    return {
      name: "redis",
      configured: false,
      reachable: false,
      details: "Redis URL not configured."
    };
  }

  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });

  try {
    await client.connect();
    const reply = await client.ping();

    return {
      name: "redis",
      configured: true,
      reachable: reply === "PONG",
      details: `Ping response: ${reply}`
    };
  } catch (error) {
    return {
      name: "redis",
      configured: true,
      reachable: false,
      details: error instanceof Error ? error.message : "Unknown error"
    };
  } finally {
    client.disconnect();
  }
}

async function checkDatabaseRuntime(): Promise<IntegrationStatus> {
  const host = new URL(env.DATABASE_URL).hostname;

  try {
    await prisma.$queryRawUnsafe("select current_database() as db");

    return {
      name: "database-runtime",
      configured: true,
      reachable: true,
      details: `Query succeeded via ${host}`
    };
  } catch (error) {
    return {
      name: "database-runtime",
      configured: true,
      reachable: false,
      details: error instanceof Error ? error.message : `Could not query ${host}`
    };
  }
}

async function checkDirectDatabaseHost(): Promise<IntegrationStatus> {
  if (!env.DIRECT_DATABASE_URL) {
    return {
      name: "database-direct-host",
      configured: false,
      reachable: false,
      details: "Direct database URL not configured."
    };
  }

  const host = new URL(env.DIRECT_DATABASE_URL).hostname;
  const result = await checkDnsHost(host);
  const details = result.reachable
    ? `Resolved ${host} (${result.hasIpv4 ? "IPv4" : "no IPv4"}, ${result.hasIpv6 ? "IPv6" : "no IPv6"})`
    : `Could not resolve ${host}`;

  return {
    name: "database-direct-host",
    configured: true,
    reachable: result.reachable,
    details
  };
}

async function checkSupabasePublicProject(): Promise<IntegrationStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return {
      name: "supabase-public-project",
      configured: false,
      reachable: false,
      details: "Public Supabase URL not configured."
    };
  }

  try {
    const response = await fetch(url);

    return {
      name: "supabase-public-project",
      configured: true,
      reachable: response.status === 404 || response.ok,
      details: `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      name: "supabase-public-project",
      configured: true,
      reachable: false,
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getIntegrationStatuses() {
  return Promise.all([
    checkDatabaseRuntime(),
    checkDirectDatabaseHost(),
    checkSupabasePublicProject(),
    checkRedis(),
    checkPaystack(),
    checkFlutterwave()
  ]);
}
