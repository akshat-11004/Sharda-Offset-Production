import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services as fallbackServices } from "@/lib-data";

export type ProductCategory = { name: string; slug: string; image?: { url: string; altText?: string | null } | null };

export function ServiceGrid({ categories = [] }: { categories?: ProductCategory[] }) {
  const items = categories.length ? categories : fallbackServices.map((service) => ({ name: service.name, slug: service.slug, image: null }));
  return <section id="products" className="relative py-16 sm:py-20 lg:py-28"><div className="container-shell"><div className="mb-8 flex items-end justify-between gap-5 sm:mb-10"><div className="max-w-xl"><p className="eyebrow">Explore our products</p><h2 className="display mt-3 text-4xl sm:text-5xl">Made to be picked up, kept, and remembered.</h2></div><Link href="/samples" className="focus-ring hidden shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold sm:inline-flex">All samples <ArrowUpRight size={16}/></Link></div><div className="product-grid">{items.slice(0, 8).map((item, index) => <Link href={`/services/${item.slug}`} key={item.slug} className={`product-card product-card-${(index % 5) + 1} focus-ring group`}>{item.image ? <img src={item.image.url} alt={item.image.altText || item.name} /> : <><img src="/images/product-placeholder.png" alt="Illustrative blank printed stationery mockup" className="product-placeholder" /><span className="product-placeholder-label">Illustrative mockup</span></>}<div className="product-card-caption"><h3>{item.name}</h3><span aria-hidden="true"><ArrowUpRight size={17}/></span></div></Link>)}</div><Link href="/samples" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold sm:hidden">Browse all samples <ArrowUpRight size={16}/></Link></div></section>;
}
