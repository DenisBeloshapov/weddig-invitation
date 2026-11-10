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
]

/** Единственный сет, который показываем гостям. */
export const MENU_SET: MenuSet = MENU_SETS[0]

export const CUISINES: Cuisine[] = ['Western', 'Thai']

export const setsOf = (c: Cuisine) => MENU_SETS.filter((m) => m.cuisine === c)
export const getSet = (id: string) => MENU_SETS.find((m) => m.id === id)
export const setLabel = (m: MenuSet) => `${m.cuisine} Set Dinner — Menu ${m.letter}`

/** Блюда основного блюда, из которых гость выбирает одно (если в сете есть выбор). */
export const mainChoices = (m: MenuSet): Dish[] => m.sections.find((s) => s.either)?.dishes ?? []
