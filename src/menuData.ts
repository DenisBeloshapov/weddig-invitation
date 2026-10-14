/**
 * Меню по скриншотам. Тексты перенесены как есть (на английском).
 * either: true — гость выбирает ОДНО блюдо из перечисленных (в меню между ними стоит «or»).
 */
export type Dish = { name: string; note?: string }
export type Section = { title: string; hint?: string; dishes: Dish[]; either?: boolean }
export type Cuisine = 'Western' | 'Thai'
export type MenuSet = { id: string; cuisine: Cuisine; letter: 'A' | 'B' | 'C'; sections: Section[] }

const CHOOSE = 'Choose from the selection of main dishes'

export const MENU_SETS: MenuSet[] = [
  {
    id: 'western-a', cuisine: 'Western', letter: 'A',
    sections: [
      { title: 'AMUSE-BOUCHE', dishes: [{ name: 'Tomato Trio Bruschetta', note: '(Parmesan crisp, basil oil, aged balsamic reduction, semi-dried cherry tomato, micro basil)' }] },
      { title: 'TO START', dishes: [{ name: 'Caesar Salad of Baby Gem Lettuce', note: '(Parmesan crisp, toasted garlic brioche, anchovy dressing)' }] },
      { title: 'SOUP', dishes: [{ name: 'Cream of Mushroom Velouté', note: 'with truffle oil' }] },
      {
        title: 'MAIN EVENT', hint: CHOOSE, either: true,
        dishes: [
          { name: 'Pan Seared Barramundi Fillet', note: '(cauliflower purée, roasted cos heart, citrus beurre Blanc)' },
          { name: 'Herb Marinated Grilled Cage Free Chicken Supreme', note: '(Carrot purée, baby garden vegetables, rosemary jus-lie)' },
        ],
      },
      { title: 'DESSERT', dishes: [{ name: 'Madagascar Vanilla Panna Cotta', note: '(Mixed berry compote, micro mint)' }] },
    ],
  },
  {
    id: 'western-b', cuisine: 'Western', letter: 'B',
    sections: [
      { title: 'AMUSE-BOUCHE', dishes: [{ name: 'Australian Wagyu Beef Tartare', note: '(Truffle aioli, brioche crisp)' }] },
      { title: 'TO START', dishes: [{ name: 'Beetroot Cured Tasmine Salmon', note: '(Beetroot and light horseradish salad, crispy capers, micro herbs)' }] },
      { title: 'SOUP', dishes: [{ name: 'Roasted Tomato & Basil Bisque', note: '(Heirloom tomato essence, basil oil, garlic ciabatta croute)' }] },
      {
        title: 'MAIN EVENT', hint: CHOOSE, either: true,
        dishes: [
          { name: 'Char-Grilled Andaman Sea Tiger Prawns', note: '(Sweet corn purée, sautéed garden greens, lemon butter emulsion)' },
          { name: 'Slow-Braised Beef Cheek', note: '(Potato purée, charred onion petals, glazed baby carrots, sautéed broccolini, aged red wine jus-lie)' },
        ],
      },
      { title: 'DESSERT', dishes: [{ name: 'Chocolate–Hazelnut Tart', note: '(Madagascar vanilla cream, cocoa nib crumble)' }] },
    ],
  },
  {
    id: 'western-c', cuisine: 'Western', letter: 'C',
    sections: [
      { title: 'AMUSE-BOUCHE', dishes: [{ name: 'Foie Gras Mousse on Brioche', note: '(Port wine jelly, microgreen salad)' }] },
      { title: 'TO START', dishes: [{ name: 'Burrata & Heirloom Tomatoes', note: '(Heirloom tomatoes, basil oil, aged balsamic)' }] },
      { title: 'SOUP', dishes: [{ name: 'Lobster Bisque', note: '(Cognac cream, aromatic herbs)' }] },
      {
        title: 'MAIN EVENT', hint: CHOOSE, either: true,
        dishes: [
          { name: 'Roasted Honey Miso Glazed Cod', note: '(Potato silk purée, sautéed broccolini, mushrooms, glazed baby carrots, edamame)' },
          { name: 'Grilled Australian 200 Day Grain Fed Beef Tenderloin 180gram', note: '(Potatoes pave, pumpkin purée, sautéed mushroom, arugula, red wine reduction)' },
        ],
      },
      { title: 'DESSERT', dishes: [{ name: 'Raspberry mille feuille', note: '(Almond Crumble, vanilla Chantilly)' }] },
    ],
  },
  {
    id: 'thai-a', cuisine: 'Thai', letter: 'A',
    sections: [
      { title: 'AMUSE-BOUCHE', dishes: [{ name: 'Gai Golek Lemongrass Skewer', note: '(Sweet coconut glaze, micro herbs, smoked chili oil)' }] },
      { title: 'TO START', dishes: [{ name: 'Benjarong Salad', note: '(Thai pomelo salad serves with grilled prawn, tamarind dressing)' }] },
      { title: 'SOUP', dishes: [{ name: 'Tom Kha Gai', note: '(Thai coconut soup with chicken)' }] },
      {
        title: 'MAIN EVENT', hint: CHOOSE, either: true,
        dishes: [
          { name: 'Thai Southern Curry Fried Fish Fried sea bass,', note: '(Southern curry sauce, sautéed local vegetables, cashew nut, garlic fried riceberry rice)' },
          { name: 'Grilled Chicken Green Curry Grilled Chicken Thigh,', note: '(Green curry sauce, sautéed local vegetables, garlic fried riceberry rice)' },
        ],
      },
      { title: 'TO FINISH', dishes: [{ name: 'Traditional Thai Mango Sticky Rice', note: '(Local Coconut Ice Cream)' }] },
    ],
  },
  {
    id: 'thai-b', cuisine: 'Thai', letter: 'B',
    sections: [
      { title: 'AMUSE-BOUCHE', dishes: [{ name: 'Bue Tod', note: '(Crisp prawn wild pepper leaf tempura, passion fruit-chili sauce)' }] },
      { title: 'TO START', dishes: [{ name: 'Yam Nua Nam Tok', note: '(Roasted wagyu beef with fresh herbs salad, roasted rice, tamarind chili dressing)' }] },
      { title: 'SOUP', dishes: [{ name: 'Tom Yum Goong', note: '(Hot & sour prawn soup)' }] },
      {
        title: 'MAIN COURSE (Family Style)',
        dishes: [
          { name: 'Gaeng Kiew Wan Moo', note: '(Green curry with pork, local eggplant and sweet basil)' },
          { name: 'Pla Krapong Nueng Manow', note: '(Steamed sea bass with chili, garlic & lime sauce)' },
          { name: 'Phad Pak Ruam', note: '(Wok-fried mixed vegetables)' },
          { name: 'Gai Phad Med Mamuang', note: '(Wok-fried chicken with cashew nut)' },
          { name: 'Nua Phad Prik Thai Dum', note: '(Wok-fried beef with garlic pepper sauce)' },
        ],
      },
      { title: 'TO FINISH', dishes: [{ name: 'Tub Tim Grob', note: '(Red ruby water chestnuts, aromatic coconut cream, young coconut slivers)' }] },
    ],
  },
]

export const CUISINES: Cuisine[] = ['Western', 'Thai']

export const setsOf = (c: Cuisine) => MENU_SETS.filter((m) => m.cuisine === c)
export const getSet = (id: string) => MENU_SETS.find((m) => m.id === id)
export const setLabel = (m: MenuSet) => `${m.cuisine} Set Dinner — Menu ${m.letter}`

/** Блюда основного блюда, из которых гость выбирает одно (если в сете есть выбор). */
export const mainChoices = (m: MenuSet): Dish[] => m.sections.find((s) => s.either)?.dishes ?? []
