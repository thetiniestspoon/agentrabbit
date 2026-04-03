import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "I asked for a meal plan and it gave me a grocery list organized by aisle. I almost cried. My daughter set it up for me and now I use it every Sunday.",
    name: "Maria",
    descriptor: "67, retired nurse",
  },
  {
    quote:
      "I was spending $50 a month on an invoicing tool. Now I spend about $2. And the invoices look better.",
    name: "Derek",
    descriptor: "small business owner",
  },
  {
    quote:
      "I organize three events a month for our community. This takes something that used to be stressful and makes it... fun?",
    name: "Keiko",
    descriptor: "library volunteer coordinator",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: "easeOut",
    },
  }),
};

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-cream-dark/40">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-warm-gray mb-4">
            What people are saying
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className={cn(
                "relative p-7 rounded-2xl",
                "bg-white/80 border border-terra/8",
                "flex flex-col"
              )}
            >
              {/* Quote mark */}
              <span className="font-display text-5xl text-terra/20 leading-none select-none mb-2">
                &ldquo;
              </span>

              <p className="font-body text-warm-gray leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>

              <div className="border-t border-terra/8 pt-4">
                <p className="font-body font-semibold text-sm text-warm-gray">
                  {t.name}
                </p>
                <p className="font-body text-xs text-warm-lighter">
                  {t.descriptor}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
