import { motion } from "framer-motion";
import { Search, Zap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Browse",
    description:
      "Scroll through helpers made by real people. Each one shows who made it, what it costs, and what other people think.",
    icon: Search,
  },
  {
    number: "02",
    title: "Hire",
    description:
      "Tap 'Hire', fill in the details, and pay. That is it. Prices start at 15 cents.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Done",
    description:
      "Your helper works and delivers results you can use, save, or share. If something goes wrong, you get your money back.",
    icon: CheckCircle,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-warm-gray mb-4">
            How it works
          </h2>
          <p className="text-warm-light font-body text-lg max-w-lg mx-auto">
            Three steps. No account needed to look around.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className={cn(
                "relative p-8 rounded-2xl",
                "bg-white/70 border border-terra/8",
                "hover:shadow-lg hover:shadow-terra/8",
                "transition-shadow duration-300"
              )}
            >
              {/* Number badge */}
              <span className="inline-block text-xs font-body font-bold tracking-widest text-terra/60 mb-4">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-cream-dark flex items-center justify-center mb-5">
                <step.icon className="w-6 h-6 text-terra" strokeWidth={1.8} />
              </div>

              <h3 className="font-display text-xl text-warm-gray mb-3">
                {step.title}
              </h3>
              <p className="font-body text-warm-light leading-relaxed">
                {step.description}
              </p>

              {/* Connecting line for md+ */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 md:-right-5 w-8 md:w-10 border-t border-dashed border-terra/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
