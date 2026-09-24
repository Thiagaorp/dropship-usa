/**
 * Camada de cache das consultas de catálogo.
 *
 * POR QUE ISSO EXISTE: em 30/08/2026 a loja saiu do ar com
 * `DriverAdapterError: Your account or project has exceeded the compute time
 * quota` (Postgres 53000) — a cota de compute do plano gratuito do Neon.
 * A causa era `export const dynamic = "force-dynamic"` na home e na /products:
 * cada visita, cada robô de busca e cada preview de link abria conexão e
 * consultava o banco. Sem venda nenhuma, a cota evaporou.
 *
 * A correção é cachear a CONSULTA, não só a página — assim vale inclusive para
 * rotas dinâmicas (a /products depende de searchParams e nunca vai ser
 * estática).
 *
 * O catálogo tem ~17 produtos que quase não mudam, então 1 hora de TTL é
 * conservador. Quando um produto é criado/editado no admin, chame
 * `invalidarCatalogo()` para furar o cache na hora em vez de esperar o TTL.
 */
/*
 * ⚠️ unstable_cache stores results as JSON: on a cache HIT, Date fields come back
 * as ISO strings even though the type says Date. Always wrap them in
 * `new Date(...)` before calling Date methods. Calling `.toISOString()` directly
 * made the home and /products return 500 on every cached request (found
 * 2026-09-24).
 */
import { unstable_cache, updateTag } from "next/cache";
import { prisma } from "@/lib/db";

/** 1 hora. Catálogo estável não precisa de menos. */
export const TTL_CATALOGO = 3600;

/** Tag única — invalidar ela derruba todo o cache de catálogo de uma vez. */
export const TAG_CATALOGO = "catalogo";

type Produto = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

/** Produtos em destaque da home. */
export const buscarDestaques = unstable_cache(
  async (): Promise<Produto[]> =>
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ["catalogo:destaques"],
  { revalidate: TTL_CATALOGO, tags: [TAG_CATALOGO] }
);

/** Lançamentos da home. */
export const buscarNovidades = unstable_cache(
  async (): Promise<Produto[]> =>
    prisma.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ["catalogo:novidades"],
  { revalidate: TTL_CATALOGO, tags: [TAG_CATALOGO] }
);

/**
 * Listagem da /products.
 *
 * `where` e `orderBy` entram como argumento e o unstable_cache os inclui na
 * chave automaticamente — cada combinação de filtro/ordenação/página ganha a
 * sua própria entrada. Sem isso, um filtro devolveria o resultado de outro.
 */
export const buscarListagem = unstable_cache(
  async (
    where: Record<string, unknown>,
    orderBy: Record<string, string>,
    take: number,
    skip: number
  ): Promise<{ produtos: Produto[]; total: number }> => {
    const [produtos, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, take, skip }),
      prisma.product.count({ where }),
    ]);
    return { produtos, total };
  },
  ["catalogo:listagem"],
  { revalidate: TTL_CATALOGO, tags: [TAG_CATALOGO] }
);

/**
 * Estatísticas de avaliação por produto.
 *
 * Os ids entram ordenados na chave para que a mesma lista em ordem diferente
 * reaproveite a entrada em vez de criar uma nova.
 */
export const buscarEstatisticasAvaliacao = unstable_cache(
  async (ids: string[]) => {
    if (ids.length === 0) return {} as Record<string, { rating: number; reviewCount: number }>;

    const agrupado = await prisma.review.groupBy({
      by: ["productId"],
      where: { productId: { in: ids } },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const mapa: Record<string, { rating: number; reviewCount: number }> = {};
    for (const g of agrupado) {
      mapa[g.productId] = {
        rating: Math.round((g._avg.rating ?? 0) * 10) / 10,
        reviewCount: g._count._all,
      };
    }
    return mapa;
  },
  ["catalogo:avaliacoes"],
  { revalidate: TTL_CATALOGO, tags: [TAG_CATALOGO] }
);

/**
 * Fura o cache do catálogo imediatamente (usar após criar/editar produto).
 *
 * Usa `updateTag` e não `revalidateTag` porque no Next 16 o `revalidateTag`
 * passou a exigir um segundo argumento de perfil de cache. O `updateTag`
 * mantém a assinatura de um argumento — mas só funciona **dentro de uma
 * Server Action**. Chamado de outro lugar, ele lança em runtime.
 */
export async function invalidarCatalogo() {
  updateTag(TAG_CATALOGO);
}
