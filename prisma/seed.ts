import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  ['Wedding Invitations', 'wedding-invitations', 'Elegant invitations, premium finishes and designs for memorable celebrations.'],
  ['NRI Kankotri', 'nri-kankotri', 'Traditional and contemporary kankotri designs prepared for families near and far.'],
  ['Business Cards', 'business-cards', 'Professional cards that make a strong first impression for your business.'],
  ['Doctor Files', 'doctor-files', 'Clinic files, prescription pads and stationery with a polished professional finish.'],
  ['Bill Books', 'bill-books', 'Custom bill books and business forms built around your daily workflow.'],
  ['Letterheads', 'letterheads', 'Crisp branded stationery for letters, quotations and official communication.'],
  ['Brochures & Catalogues', 'brochures-catalogues', 'Folded and bound marketing collateral that presents your products beautifully.'],
  ['Stickers & Labels', 'stickers-labels', 'Custom labels and stickers for packaging, products, events and promotions.'],
  ['Banners & Flex', 'banners-flex', 'Large-format printing for promotions, events, storefronts and campaigns.'],
  ['Standees', 'standees', 'High-impact display graphics for retail, events and public spaces.'],
  ['LED & Sign Boards', 'led-sign-boards', 'Signage solutions designed to make your business visible from the street.'],
  ['Corporate Printing', 'corporate-printing', 'Consistent branded print collateral for offices, teams and organizations.'],
  ['Custom Printing', 'custom-printing', 'Have something specific in mind? Tell us what you need and we will help.'],
] as const;

const categories = [
  ['Wedding Cards', 'wedding-cards'], ['NRI Kankotri', 'nri-kankotri'], ['Business Cards', 'business-cards'],
  ['Doctor Files', 'doctor-files'], ['Bill Books', 'bill-books'], ['Letterheads', 'letterheads'],
  ['Brochures', 'brochures'], ['Catalogues', 'catalogues'], ['Stickers', 'stickers'], ['Labels', 'labels'],
  ['Banners', 'banners'], ['Standees', 'standees'], ['LED Boards', 'led-boards'], ['Corporate Printing', 'corporate-printing'], ['Other', 'other'],
] as const;

const samples = [
  ['Royal Wedding Invitation', 'royal-wedding-invitation', 'wedding-cards', 'wedding-invitations', 'A warm, layered invitation concept with an elegant ceremonial feel.', ['premium', 'wedding', 'royal']],
  ['Gold Kankotri', 'gold-kankotri', 'nri-kankotri', 'nri-kankotri', 'A refined kankotri direction combining classic typography and gold-inspired detailing.', ['traditional', 'gold', 'kankotri']],
  ['Minimal Business Card', 'minimal-business-card', 'business-cards', 'business-cards', 'Clean, confident stationery for a modern professional identity.', ['corporate', 'minimal', 'business']],
  ['Clinic File System', 'clinic-file-system', 'doctor-files', 'doctor-files', 'A practical doctor-file direction with clear information hierarchy.', ['doctor', 'clinic', 'stationery']],
  ['Artisan Label Set', 'artisan-label-set', 'labels', 'stickers-labels', 'A tactile label family designed to give products a handcrafted presence.', ['packaging', 'labels', 'artisan']],
  ['Event Standee', 'event-standee', 'standees', 'standees', 'A bold vertical display concept for entrances, launches and events.', ['display', 'event', 'standee']],
  ['Premium Letterhead', 'premium-letterhead', 'letterheads', 'letterheads', 'A restrained stationery system with premium paper-inspired styling.', ['office', 'letterhead', 'premium']],
  ['Retail Promo Banner', 'retail-promo-banner', 'banners', 'banners-flex', 'High-contrast large-format direction designed for quick roadside readability.', ['banner', 'retail', 'large-format']],
] as const;

const faqs = [
  ['What types of printing do you provide?', 'We handle wedding invitations, kankotri, visiting and business cards, doctor files, bill books, letterheads, brochures, catalogues, stickers, labels, banners, standees, signage and custom printing.'],
  ['Can I request a custom design?', 'Yes. Share your requirement with the shop and the team can discuss the suitable format, materials, finishing and design direction.'],
  ['Can I send my requirements on WhatsApp?', 'Yes. WhatsApp is one of the quickest ways to share a requirement or ask about a sample.'],
  ['Can I see samples before ordering?', 'Yes. Browse the sample gallery for inspiration and use Request Similar on a design you like.'],
  ['How can I request a quotation?', 'Send your quantity, size, material or finishing preferences and any reference through the enquiry form or WhatsApp.'],
  ['How quickly can you complete an order?', 'Turnaround depends on the product, quantity, finishing and current production schedule. The shop can confirm timing for your requirement.'],
];

async function main() {
  console.log('Seeding Sharda Offset database...');

  const serviceMap = new Map<string, string>();
  for (const [index, [name, slug, description]] of services.entries()) {
    const service = await prisma.service.upsert({
      where: { slug },
      update: { name, description, isActive: true, displayOrder: index },
      create: { name, slug, description, displayOrder: index },
    });
    serviceMap.set(slug, service.id);
  }

  const categoryMap = new Map<string, string>();
  for (const [name, slug] of categories) {
    const category = await prisma.category.upsert({ where: { slug }, update: { name }, create: { name, slug } });
    categoryMap.set(slug, category.id);
  }

  for (const [index, [title, slug, categorySlug, serviceSlug, description, tags]] of samples.entries()) {
    await prisma.sample.upsert({
      where: { slug },
      update: { title, description, categoryId: categoryMap.get(categorySlug)!, serviceId: serviceMap.get(serviceSlug)!, tags: [...tags], isActive: true, isFeatured: index < 4 },
      create: { title, slug, description, categoryId: categoryMap.get(categorySlug)!, serviceId: serviceMap.get(serviceSlug)!, tags: [...tags], isFeatured: index < 4 },
    });
  }

  for (const [index, [question, answer]] of faqs.entries()) {
    const existing = await prisma.fAQ.findFirst({ where: { question } });
    if (existing) await prisma.fAQ.update({ where: { id: existing.id }, data: { answer, isActive: true, displayOrder: index } });
    else await prisma.fAQ.create({ data: { question, answer, displayOrder: index } });
  }

  console.log(`Seeded ${services.length} services, ${categories.length} categories, ${samples.length} samples and ${faqs.length} FAQs.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
