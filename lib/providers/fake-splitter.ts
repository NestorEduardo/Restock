import type { LineSplitter, SplitLine } from "@/lib/engine/split";

const FIXTURES: Record<string, SplitLine[]> = {
  "2 cases of 6ft usb c braided black": [
    {
      quantity: 2,
      unit: "cases",
      description: "6ft usb c braided black",
      raw: "2 cases of 6ft usb c braided black",
    },
  ],
  "10 tempered glass screen protectors for the 14 pro": [
    {
      quantity: 10,
      unit: null,
      description: "tempered glass screen protectors for the 14 pro",
      raw: "10 tempered glass screen protectors for the 14 pro",
    },
  ],
  "3 wall chargers 20w usb-c white": [
    {
      quantity: 3,
      unit: null,
      description: "wall chargers 20w usb-c white",
      raw: "3 wall chargers 20w usb-c white",
    },
  ],
  "a 20000mah power bank": [
    {
      quantity: 1,
      unit: null,
      description: "20000mah power bank",
      raw: "a 20000mah power bank",
    },
  ],
  "5 micro sd 128": [
    {
      quantity: 5,
      unit: null,
      description: "micro sd 128",
      raw: "5 micro sd 128",
    },
  ],
  "send me 2 cases of usb c cables, 3 car chargers and 10 screen protectors for the 15 pro":
    [
      {
        quantity: 2,
        unit: "cases",
        description: "usb c cables",
        raw: "2 cases of usb c cables",
      },
      {
        quantity: 3,
        unit: null,
        description: "car chargers",
        raw: "3 car chargers",
      },
      {
        quantity: 10,
        unit: null,
        description: "screen protectors for the 15 pro",
        raw: "10 screen protectors for the 15 pro",
      },
    ],
  "need:\n- 12 clear cases iphone 14\n- 6 bluetooth earbuds\n- 2 medium speakers": [
    {
      quantity: 12,
      unit: null,
      description: "clear cases iphone 14",
      raw: "12 clear cases iphone 14",
    },
    {
      quantity: 6,
      unit: null,
      description: "bluetooth earbuds",
      raw: "6 bluetooth earbuds",
    },
    {
      quantity: 2,
      unit: null,
      description: "medium speakers",
      raw: "2 medium speakers",
    },
  ],
  "hey, for today: 5 lightning 3ft, 5 lightning 6ft and 3 45w chargers": [
    {
      quantity: 5,
      unit: null,
      description: "lightning 3ft",
      raw: "5 lightning 3ft",
    },
    {
      quantity: 5,
      unit: null,
      description: "lightning 6ft",
      raw: "5 lightning 6ft",
    },
    {
      quantity: 3,
      unit: null,
      description: "45w chargers",
      raw: "3 45w chargers",
    },
  ],
  "give me 5 usb c cables": [
    {
      quantity: 5,
      unit: null,
      description: "usb c cables",
      raw: "give me 5 usb c cables",
    },
  ],
  "2 cases for the 14": [
    {
      quantity: 2,
      unit: null,
      description: "cases for the 14",
      raw: "2 cases for the 14",
    },
  ],
  "send the galaxy screen protectors": [
    {
      quantity: 1,
      unit: null,
      description: "galaxy screen protectors",
      raw: "send the galaxy screen protectors",
    },
  ],
  "3 chargers": [
    {
      quantity: 3,
      unit: null,
      description: "chargers",
      raw: "3 chargers",
    },
  ],
  "10 of the blue ones": [
    {
      quantity: 10,
      unit: null,
      description: "blue ones",
      raw: "10 of the blue ones",
    },
  ],
  "a ring light": [
    {
      quantity: 1,
      unit: null,
      description: "ring light",
      raw: "a ring light",
    },
  ],
  "put me down for 2 dozen clear cases 15 pro": [
    {
      quantity: 2,
      unit: "dozen",
      description: "clear cases 15 pro",
      raw: "2 dozen clear cases 15 pro",
    },
  ],
  "i need 3 pallets of usb c cables": [
    {
      quantity: 3,
      unit: "pallet",
      description: "usb c cables",
      raw: "3 pallets of usb c cables",
    },
  ],
  "6 of the fast chargers": [
    {
      quantity: 6,
      unit: null,
      description: "fast chargers",
      raw: "6 of the fast chargers",
    },
  ],
  "the car charger i got last time": [
    {
      quantity: 1,
      unit: null,
      description: "car charger i got last time",
      raw: "the car charger i got last time",
    },
  ],
  "4 camera lens protectors for the 16 pro": [
    {
      quantity: 4,
      unit: null,
      description: "camera lens protectors for the 16 pro",
      raw: "4 camera lens protectors for the 16 pro",
    },
  ],
  "5 of those long braided ones": [
    {
      quantity: 5,
      unit: null,
      description: "long braided ones",
      raw: "5 of those long braided ones",
    },
  ],
  "2 cse of usb-c cabel 6 ft": [
    {
      quantity: 2,
      unit: "cse",
      description: "usb-c cabel 6 ft",
      raw: "2 cse of usb-c cabel 6 ft",
    },
  ],
  "10 SCREEN PROTECTORS IPHONE 15 PRO GLASS": [
    {
      quantity: 10,
      unit: null,
      description: "SCREEN PROTECTORS IPHONE 15 PRO GLASS",
      raw: "10 SCREEN PROTECTORS IPHONE 15 PRO GLASS",
    },
  ],
  "bluetooth earbuds x 6": [
    {
      quantity: 6,
      unit: null,
      description: "bluetooth earbuds",
      raw: "bluetooth earbuds x 6",
    },
  ],
  "hey good morning": [],
  "how much is the 6ft usb c cable?": [],
  "2 cases of bicycles": [
    {
      quantity: 2,
      unit: "cases",
      description: "bicycles",
      raw: "2 cases of bicycles",
    },
  ],
  "send me a bit of everything": [],
  "500 usb c cables 3ft black": [
    {
      quantity: 500,
      unit: null,
      description: "usb c cables 3ft black",
      raw: "500 usb c cables 3ft black",
    },
  ],
};

export class FakeLineSplitter implements LineSplitter {
  async split(message: string): Promise<SplitLine[]> {
    const fixture = FIXTURES[message];
    if (fixture !== undefined) {
      return fixture.map((line) => ({ ...line }));
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return [];
    }

    return [
      {
        quantity: 1,
        unit: null,
        description: trimmed,
        raw: trimmed,
      },
    ];
  }
}
