export interface Product {
  id: string
  name: string
  subName: string
  price: string
  description: string
  themeColor: string
  gradient: string
  bgFrom: string
  features: string[]
  techSpecs: { label: string; val: string }[]
  section1: { title: string; subtitle: string }
  section2: { title: string; subtitle: string }
  section3: { title: string; subtitle: string }
  section4: { title: string; subtitle: string }
  detailsSection: { title: string; description: string; imageAlt: string }
  techSection: { title: string; description: string }
  buyNowSection: {
    price: string
    sizeOptions: string[]
    iotFeatures: string[]
    deliveryPromise: string
    warranty: string
  }
}

export const products: Product[] = [
  {
    id: "pawtrack",
    name: "Pawtrack strap",
    subName: "The ultimate connection.",
    price: "NPR 8000",
    description: "Live GPS · Health Vitals · Active LED Safety",
    themeColor: "#C9A84C",
    gradient: "linear-gradient(135deg, #080608 0%, #130f08 60%, #080608 100%)",
    bgFrom: "#080608",
    features: ["Real-time GPS Tracking", "Heart Rate Monitor", "Dynamic LED Ring"],
    techSpecs: [
      { label: "Battery", val: "14 Days" },
      { label: "Waterproof", val: "IP68" },
      { label: "Connectivity", val: "LTE / BT" },
    ],
    section1: {
      title: "Pawtrack.",
      subtitle: "They are our best friends. And every friend deserves the perfect gift.",
    },
    section2: {
      title: "Never lose sight.",
      subtitle: "Military-grade GPS tracking ensures you always know exactly where your best friend is, right from your phone.",
    },
    section3: {
      title: "Health at a glance.",
      subtitle: "Built-in biometric sensors monitor resting heart rate, activity levels, and sleep quality — 24 / 7.",
    },
    section4: {
      title: "Designed for the beat.",
      subtitle: "Aerospace-grade hardware meets breathable neoprene. Ready for mud, rain, and everything in between.",
    },
    detailsSection: {
      title: "Ergonomic Comfort",
      description:
        "Engineered with breathable, anti-chafing neoprene and lightweight aerospace-grade aluminum hardware. Pawtrack distributes pulling pressure evenly across the chest, protecting your dog's delicate trachea while housing advanced IoT sensors.",
      imageAlt: "Pawtrack Details",
    },
    techSection: {
      title: "Smart Ecosystem",
      description:
        "The collar syncs effortlessly with the Pawtrack App. Set safe zones, receive escape alerts in milliseconds, and track long-term health trends to share directly with your vet.",
    },
    buyNowSection: {
      price: "NPR 8000",
      sizeOptions: ["S", "M", "L", "XL"],
      iotFeatures: ["Includes 1-Year LTE Data", "Free App Access", "Over-the-air Updates"],
      deliveryPromise: "Free express shipping worldwide. Dispatches within 24 hours.",
      warranty: "2-Year Hardware Warranty. Built to survive the muddiest adventures.",
    },
  },
]
