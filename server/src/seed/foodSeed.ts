import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Food } from '../models/Food';

dotenv.config();

const foodItems = [
  {
    name: 'Chicken Biryani',
    price: 120,
    category: 'Lunch',
    stockQuantity: 24,
    isVegetarian: false,
    tags: ['rice', 'spicy', 'popular'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATeBE0gd827NLa1L-EEKGkWmAG2OMsNfhOul8yX1vyFNOZ2_mrouiunPDm5V0H4ZUp5meLIArHgmlE2zglih_iDE_76eFILZTW8BFB3P5TKgO1pZ3Pp2VOkldSBtqVV0b3Fj2F0wDYZ--8mXBtmRTftbWzBN2S_eUSNQbDY8P4YT81qK8jZaShqepCuUJhVO_DOI8-RIqoMpX6kap1NhUsUwVKlTpPIrXTlPM9ISTzAiTHLHqnt7NHEeJErUne76q8b0p2PbCHj4k',
  },
  {
    name: 'Veg Burger',
    price: 85,
    category: 'Snacks',
    stockQuantity: 15,
    isVegetarian: true,
    tags: ['burger', 'healthy', 'vegetarian'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLLKfmAdn-odOdV06UBfHD8i1TtOx5566-6upsMPBJBPDa1O6NT1Zvg8BKmHG2OGZPhEHx35hwfyjGeUa9puYcz9yylu4-N7CA6BAc0F6mPRdUXU7EiXKga6oySq1ztoleqDa_j0X-CT4ynxdvtFQoulJDk16Q4uAiOTfOUn07lCk2Uzhg5uvInUlgIWaYKiTaIyro3zU27wtJlIAPxmJe3GbFRMapZEgZ_umerH72yZiO_jrwIsgmVEHhBeeVHaw_p_O37vk41uA',
  },
  {
    name: 'Paneer Butter Masala',
    price: 140,
    category: 'Lunch',
    stockQuantity: 12,
    isVegetarian: true,
    tags: ['curry', 'creamy', 'popular'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASWFQlWuTESCHRoPoIH3QfUuuClaGVQdV2ZJJMQpRlETupnNGN4hh0ylYFuaree1j8J6xzjrAgBj2l_-wPIFS5GQNBtldsxmQkEE-cCFtazz_djoKkV_b5f3MTWJ6586p2lUTbYWoHxW2KCSnmpyO1nimZdiH-DV5xMQckXU4E7QkuqxJ_KkjZ0Yu-ArXT-INuo0K7zorar_2WeCmSV85z4a4xW_hZwPIsSiRN4DBtR1jmUPK5GEruP-0rN_SWKI4iECw2R1M2G7k',
  },
  {
    name: 'Cold Coffee',
    price: 40,
    category: 'Drinks',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['beverage', 'cold', 'coffee'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV4SC6qEClehBkXGdyCjzw7byTo5y36bcUvTr0TD2pUML6Vzo7MjZFkBQG6pReB3LLBDpJh-3YPs5w4-UeQxfa5QVT-8ClIyJmhvPNM3RAqQhoeI_PlHHsAOh2JuswQHntkxRRulKXuBvzen5WVIkaAF6C4RoECuENnnTB0hq72iWSb5-yRMibK1uyJny1CErcrPdqLG91caCYH0JKrd-wbvQ6Vsdt2hKsxYw5eBQU1skFwfPAQgbbFU8LH-zX9YSXVgzhkza_oO8',
  },
  {
    name: 'North Indian Thali',
    price: 180,
    category: 'Lunch',
    stockQuantity: 10,
    isVegetarian: true,
    tags: ['thali', 'complete meal', 'traditional'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP0bvskw_KJGar9-F5s62ab_py2RrKqY2qUpDdsR1cqd-bIaCfqXB6jc0NLXXCGpKu8jE3V0LPe2aWzghEdYSBIByKoxtUHB5nX7GqhujOXVRS0KkONnZbF_NoLbocENy8T5gabg3o_0xGa0hlHl2SnHctHxflfZmPIeBdlPtmqZfhYzmbshh--uIWrDt1aptLceN7YlVE-uRXfV9dil2LxiKKULaEkmYMvtVGD6r5hKm2thQKEZ0s4pkqTBGMfnQwYAI50mRUFWI',
  },
  {
    name: 'Chicken Sandwich',
    price: 95,
    category: 'Snacks',
    stockQuantity: 18,
    isVegetarian: false,
    tags: ['sandwich', 'chicken', 'quick'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TuxZ0NCMWz_gywyTOp_Tmk-NipQXicxyzAnl8hv9JYdTTzVzp1vCn8nFZreV2M8AW0altwDU50yAPeIIdKF2o7NgKgg-2ZD_JRmBjGdNrwH4GMSPDuSVz88mYMW5NOk4_3j-jpklQ-qIQIRdiJV4ddvVZVR2hrtSgcIxAnTDAPZvWXbBO3buloETTyi3SDZ0QwNBR9rCX06v00HlnBTp-RLm5MifErHZQvueQyCK1H1WbUcB3h2LPIL9C-tyQJFSEbMvhCDaY24',
  },
  {
    name: 'Fruit Salad',
    price: 70,
    category: 'Snacks',
    stockQuantity: 15,
    isVegetarian: true,
    tags: ['healthy', 'fresh', 'fruits'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLS6GtuHFhe1Y-LGqR4ZZhyPYCtaib7KPp0HG_0qAdMRkAAyUU0JE8_x4EIdjCF8gJMbdx0smmyhVaQsp3XPf69pk_96mWlxRW1tQ7Ua5C75vD5iFeIic0Hh5KqMb3os0khv7fVSzU2lEwvZk_D1A9L7jatdatoflChy3Vhd9gmMw34-hF9b8MK01QlQINMiOEEha3lzkLwdPp8HOcoP-6OHKQr1XCsjO7fSxIVp2oDjvHZR9mwkfru3Hldg1GO_KfDwCAhK1DdfE',
  },
  {
    name: 'Idli Sambar',
    price: 50,
    category: 'Breakfast',
    stockQuantity: 30,
    isVegetarian: true,
    tags: ['south indian', 'healthy', 'light'],
    image:'https://t3.ftcdn.net/jpg/04/02/12/80/240_F_402128075_06J9Y69ScRrYKFpQr1PAH0L7YziB83ry.jpg'
  },
  {
    name: 'Vada Pav',
    price: 35,
    category: 'Snacks',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['street food', 'spicy', 'quick'],
    image: 'https://t3.ftcdn.net/jpg/05/38/15/30/240_F_538153050_hs85BVbShqsaHxG1IJrpJfLH7YJxTIaM.jpg'
  },

  {
    name: 'Chai (Tea)',
    price: 15,
    category: 'Drinks',
    stockQuantity: 50,
    isVegetarian: true,
    tags: ['hot', 'beverage', 'refreshing'],
    image: 'https://t3.ftcdn.net/jpg/02/38/23/40/240_F_238234081_eg6v3rGDVl0wRKOJNO5A82umOsTcf2KA.jpg'
  },
  {
    name: 'Medu Vada ',
    price: 5,
    category: 'Breakfast',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['crispy', 'fried'],
    image: 'https://t4.ftcdn.net/jpg/14/62/57/49/240_F_1462574997_i8DHv9tFphDIllggUwuRM8hulJsvhI29.jpg'
  },
  {
    name: 'Pongal',
    price: 50,
    category: 'Breakfast',
    stockQuantity: 15,
    isVegetarian: true,
    tags: ['rice', 'ghee'],
    image: 'https://t3.ftcdn.net/jpg/09/67/01/74/240_F_967017466_suiQHeJL3nVZVMoOzXkf32fDNBKaetYt.jpg'
  },
  {
    name: 'Poori Masala',
    price: 55,
    category: 'Breakfast',
    stockQuantity: 12,
    isVegetarian: true,
    tags: ['potato', 'fried'],
    image: 'https://t4.ftcdn.net/jpg/04/98/13/23/240_F_498132312_2hCIYfgkvzgi6RQJ9LkpEsXLQRgdyv54.jpg'
  },
  {
    name: 'Plain Dosa',
    price: 45,
    category: 'Breakfast',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['simple', 'quick'],
    image: 'https://t4.ftcdn.net/jpg/18/16/04/25/240_F_1816042509_1USIlM6qE7rCk9dZNNYYqCWsp9YDF3AB.jpg'
  },
  {
    name: 'Onion Uthappam',
    price: 65,
    category: 'Breakfast',
    stockQuantity: 10,
    isVegetarian: true,
    tags: ['onion', 'tasty'],
    image: 'https://t3.ftcdn.net/jpg/09/40/52/56/240_F_940525648_wq4j07Nqp39jJ2TnbqkQFBxKrh95c1KV.jpg'
  },
  {
    name: 'Bread Omelette',
    price: 50,
    category: 'Breakfast',
    stockQuantity: 20,
    isVegetarian: false,
    tags: ['eggs', 'protein'],
    image: 'https://t4.ftcdn.net/jpg/05/94/87/47/240_F_594874719_a3ukzsPzg6ZWuwuDouwoXoGaprU3dcBr.jpg'
  },
  {
    name: 'Aloo Paratha',
    price: 40,
    category: 'Breakfast',
    stockQuantity: 15,
    isVegetarian: true,
    tags: ['north indian', 'spicy'],
    image: 'https://t3.ftcdn.net/jpg/09/45/46/72/240_F_945467264_13rCx2nGR9wb9wrVt2g2FEFB4tE4b8sW.jpg'
  },
  {
    name: 'Poha',
    price: 35,
    category: 'Breakfast',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['light', 'healthy'],
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93'
  },
  {
    name: 'Upma',
    price: 35,
    category: 'Breakfast',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['semolina', 'classic'],
    image: 'https://t3.ftcdn.net/jpg/02/16/69/88/240_F_216698845_uhpzt1stNfO4IHb9Xj3LcrKoqm5liGvS.jpg'
  },
  {
    name: 'Vegetable Sandwich',
    price: 45,
    category: 'Breakfast',
    stockQuantity: 18,
    isVegetarian: true,
    tags: ['fresh', 'veg'],
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af'
  },
  {
    name: 'Appam ',
    price: 60,
    category: 'Breakfast',
    stockQuantity: 10,
    isVegetarian: true,
    tags: ['sweet', 'coconut'],
    image: 'https://t3.ftcdn.net/jpg/17/23/34/22/240_F_1723342234_p0HRJWN512cb90NHXqc2UvK8YMbDeo7Q.jpg'
  },
  {
    name: 'Semiya Upma',
    price: 40,
    category: 'Breakfast',
    stockQuantity: 15,
    isVegetarian: true,
    tags: ['vermicelli', 'savory'],
    image: 'https://t3.ftcdn.net/jpg/15/48/52/26/240_F_1548522618_NDCW5dOZBewMHgLxgKUyYRX7YIhwP3rS.jpg'
  },
  {
    name: 'Set Dosa',
    price: 55,
    category: 'Breakfast',
    stockQuantity: 12,
    isVegetarian: true,
    tags: ['soft', 'sponge'],
    image: 'https://t4.ftcdn.net/jpg/03/06/02/09/240_F_306020949_MeaL6xgQVI73ECGpTbcstyBJYx81edGr.jpg'
  },
  {
    name: 'Veg Meals',
    price: 120,
    category: 'Lunch',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['south indian', 'full meals'],
    image: 'https://t4.ftcdn.net/jpg/06/16/01/57/240_F_616015790_nx4OX726qiU8AHTNEgwf78rqs6PGFaT9.jpg'
  },
  {
    name: 'Veg Biryani',
    price: 95,
    category: 'Lunch',
    stockQuantity: 18,
    isVegetarian: true,
    tags: ['biryani', 'vegetables'],
    image: 'https://t3.ftcdn.net/jpg/06/79/32/62/240_F_679326226_CRJhluLFEwuCYIevWIdMGdXUAtKwiLa6.jpg'
  },
  {
    name: 'Curd Rice',
    price: 50,
    category: 'Lunch',
    stockQuantity: 30,
    isVegetarian: true,
    tags: ['cooling', 'rice'],
    image: 'https://t3.ftcdn.net/jpg/08/51/99/48/240_F_851994857_eHvfQsIp04G5UvgGubjXbExwxsfg24sG.jpg'
  },
  {
    name: 'Sambar Rice',
    price: 60,
    category: 'Lunch',
    stockQuantity: 22,
    isVegetarian: true,
    tags: ['sambar', 'comfort food'],
    image: 'https://t4.ftcdn.net/jpg/04/97/27/31/240_F_497273126_pikW8XumWHbIQyQwU1wJkUIBCP4GOLMP.jpg'
  },
  {
    name: 'Lemon Rice',
    price: 55,
    category: 'Lunch',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['tangy', 'light'],
    image: 'https://t3.ftcdn.net/jpg/00/89/08/46/240_F_89084661_2DEKxrxDQT3VGFytrQyLxohvnSD79792.jpg'
  },
  {
    name: 'Tomato Rice',
    price: 55,
    category: 'Lunch',
    stockQuantity: 18,
    isVegetarian: true,
    tags: ['tomato', 'spicy'],
    image: 'https://t4.ftcdn.net/jpg/06/07/91/93/240_F_607919387_LWGpfHd6MacPQ10IVaQiPRHp7mGRqV2y.jpg'
  },
  {
    name: 'Chicken Curry + Rice',
    price: 110,
    category: 'Lunch',
    stockQuantity: 16,
    isVegetarian: false,
    tags: ['chicken', 'gravy'],
    image: 'https://t3.ftcdn.net/jpg/07/07/38/70/240_F_707387089_YHu53iv44NQ3uE2T0djzv5aM2Z5k9e40.jpg'
  },
  {
    name: 'Egg Fried Rice',
    price: 80,
    category: 'Lunch',
    stockQuantity: 20,
    isVegetarian: false,
    tags: ['egg', 'fried rice'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b'
  },
  {
    name: 'Veg Fried Rice',
    price: 75,
    category: 'Lunch',
    stockQuantity: 22,
    isVegetarian: true,
    tags: ['fried rice', 'indo chinese'],
    image: 'https://t3.ftcdn.net/jpg/06/54/11/58/240_F_654115859_ePeT33Nf56xGKVWDzDCGJX3hRAoU9shn.jpg'
  },
  {
    name: 'Chicken Fried Rice',
    price: 95,
    category: 'Lunch',
    stockQuantity: 18,
    isVegetarian: false,
    tags: ['chicken', 'indo chinese'],
    image: 'https://t4.ftcdn.net/jpg/06/76/08/39/240_F_676083915_5qrwqdzitRqDlc3X7PM9bxH7VggFEIVU.jpg'
  },
  {
    name: 'Chapati + Veg Curry',
    price: 60,
    category: 'Lunch',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['north indian', 'healthy'],
    image: 'https://t4.ftcdn.net/jpg/12/14/03/65/360_F_1214036550_qUXOuDUNMsR3SfYi8tUJl6M5sVY2maJU.jpg'
  },
  {
    name: 'Chapati + Chicken Curry',
    price: 85,
    category: 'Lunch',
    stockQuantity: 15,
    isVegetarian: false,
    tags: ['chapati', 'chicken'],
    image: 'https://t4.ftcdn.net/jpg/10/13/10/53/360_F_1013105358_dTA6FNKkS4wsJXGQHuqdUHVi2ZnEYm1a.jpg'
  },
  {
    name: 'Paneer Butter Masala + Rice',
    price: 100,
    category: 'Lunch',
    stockQuantity: 14,
    isVegetarian: true,
    tags: ['paneer', 'gravy'],
    image: 'https://t3.ftcdn.net/jpg/11/13/39/86/240_F_1113398667_NP9VuRLxHjq0mU4DTWmY2talcBHXZwOA.jpg'
  },
  {
    name: 'Fish Curry + Rice',
    price: 120,
    category: 'Lunch',
    stockQuantity: 10,
    isVegetarian: false,
    tags: ['fish', 'coastal'],
    image: 'https://t3.ftcdn.net/jpg/15/67/01/84/240_F_1567018434_JvlK76zimJyCT4C7kqJlS4ZvZRvjy6i8.jpg'
  },
  {
    name: 'Plain Dosa',
    price: 45,
    category: 'Dinner',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['light', 'south indian'],
    image: 'https://t3.ftcdn.net/jpg/16/83/32/08/240_F_1683320878_r7XLt2hi79U0y0buhtdG7kWEtOGePar0.jpg'
  },
  {
    name: 'Masala Dosa',
    price: 60,
    category: 'Dinner',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['crispy', 'filling'],
    image: 'https://t3.ftcdn.net/jpg/16/45/73/34/240_F_1645733469_9ZE8qzWxuEvyBJ1N36LdmmDrgvMzvU0c.jpg'
  },
  {
    name: 'Chapati + Veg Curry',
    price: 60,
    category: 'Dinner',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['north indian', 'light'],
    image: 'https://t4.ftcdn.net/jpg/12/14/03/65/360_F_1214036550_qUXOuDUNMsR3SfYi8tUJl6M5sVY2maJU.jpg'
  },
  {
    name: 'Chapati + Chicken Curry',
    price: 85,
    category: 'Dinner',
    stockQuantity: 15,
    isVegetarian: false,
    tags: ['protein', 'spicy'],
    image: 'https://t4.ftcdn.net/jpg/02/42/74/31/360_F_242743136_RYsBnwSL1Tfs1UsPUFXGrsPp1nPXe8nv.jpg'
  },
  {
    name: 'Vegetable Fried Rice',
    price: 75,
    category: 'Dinner',
    stockQuantity: 22,
    isVegetarian: true,
    tags: ['indo chinese', 'quick'],
    image: 'https://t4.ftcdn.net/jpg/07/17/44/91/240_F_717449146_SSz4cFevaC1qLGAu10qxjFKuHSzf661c.jpg'
  },
  {
    name: 'Egg Fried Rice',
    price: 80,
    category: 'Dinner',
    stockQuantity: 18,
    isVegetarian: false,
    tags: ['egg', 'protein'],
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b'
  },
  {
    name: 'Chicken Fried Rice',
    price: 95,
    category: 'Dinner',
    stockQuantity: 16,
    isVegetarian: false,
    tags: ['chicken', 'indo chinese'],
    image: 'https://t4.ftcdn.net/jpg/06/28/05/71/240_F_628057142_3H4Www7k6nhhxn9nJD7sieUmyUZdLLy0.jpg'
  },
  {
    name: 'Veg Noodles',
    price: 70,
    category: 'Dinner',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['noodles', 'fast'],
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce'
  },
  {
    name: 'Chicken Noodles',
    price: 90,
    category: 'Dinner',
    stockQuantity: 14,
    isVegetarian: false,
    tags: ['noodles', 'chicken'],
    image: 'https://t3.ftcdn.net/jpg/09/83/79/72/240_F_983797231_3Y3MSRrJrQoYgssSVRblrk0BCBBXsWq9.jpg'
  },
  {
    name: 'Paneer Butter Masala + Chapati',
    price: 100,
    category: 'Dinner',
    stockQuantity: 12,
    isVegetarian: true,
    tags: ['paneer', 'gravy'],
    image: 'https://t3.ftcdn.net/jpg/16/02/58/82/240_F_1602588254_NTwaZEp4OKQQAje68Icdpc2NkC9q2U4z.jpg'
  },
  {
    name: 'Parotta + Salna',
    price: 60,
    category: 'Dinner',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['tamil', 'street food'],
    image: 'https://t3.ftcdn.net/jpg/13/97/24/56/240_F_1397245642_Vy2wlCN3pgsPabJShytmSqPGJ7uBP3EK.jpg'
  },
  {
    name: 'Chicken Gravy + Parotta',
    price: 95,
    category: 'Dinner',
    stockQuantity: 15,
    isVegetarian: false,
    tags: ['parotta', 'spicy'],
    image: 'https://t3.ftcdn.net/jpg/08/37/11/06/240_F_837110646_CWCgkuiGHSwOmV9QrYtIdsMBo3bdNmmn.jpg'
  },
  {
    name: 'Samosa',
    price: 25,
    category: 'Snacks',
    stockQuantity: 40,
    isVegetarian: true,
    tags: ['fried', 'spicy'],
    image: 'https://t4.ftcdn.net/jpg/01/15/65/65/240_F_115656542_29CX7CGPXudSb3DTp25hcQDZeo3djiTc.jpg'
  },
  {
    name: 'Veg Puff',
    price: 20,
    category: 'Snacks',
    stockQuantity: 35,
    isVegetarian: true,
    tags: ['bakery', 'crispy'],
    image: 'https://t3.ftcdn.net/jpg/04/01/04/62/240_F_401046286_TOB9lxDVlES1va5hUOfCnofqGFxLwuWF.jpg'
  },
  {
    name: 'Egg Puff',
    price: 25,
    category: 'Snacks',
    stockQuantity: 30,
    isVegetarian: false,
    tags: ['egg', 'bakery'],
    image: 'https://t3.ftcdn.net/jpg/08/16/26/58/240_F_816265864_sOhbjWSCGUdlKXKX0HeqYhL6tb3sZk1L.jpg'
  },
  {
    name: 'Chicken Puff',
    price: 35,
    category: 'Snacks',
    stockQuantity: 25,
    isVegetarian: false,
    tags: ['chicken', 'bakery'],
    image: 'https://t4.ftcdn.net/jpg/08/58/52/91/240_F_858529158_NtjX4hL4EqDlLRnHYxXa91kvyLXQNHzf.jpg'
  },
  {
    name: 'Bajji',
    price: 30,
    category: 'Snacks',
    stockQuantity: 30,
    isVegetarian: true,
    tags: ['street food', 'fried'],
    image: 'https://t3.ftcdn.net/jpg/07/76/97/40/240_F_776974096_TmSAMaRL34G5vbAUGG2CH5vdklQ8zSyM.jpg'
  },
  {
    name: 'Bonda',
    price: 30,
    category: 'Snacks',
    stockQuantity: 30,
    isVegetarian: true,
    tags: ['potato', 'fried'],
    image: 'https://t3.ftcdn.net/jpg/08/16/75/72/240_F_816757263_rmkEsPNOerYg3VluduuVB72kt01h0fTB.jpg'
  },
  {
    name: 'Cutlet',
    price: 35,
    category: 'Snacks',
    stockQuantity: 28,
    isVegetarian: true,
    tags: ['veg', 'crispy'],
    image: 'https://t4.ftcdn.net/jpg/06/05/49/81/240_F_605498100_5h1UbV564wGM7nRVGNbhGYAYQb6MG6P7.jpg'
  },
  {
    name: 'French Fries',
    price: 40,
    category: 'Snacks',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['fast food', 'potato'],
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5'
  },
  {
    name: 'Veg Momos',
    price: 50,
    category: 'Snacks',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['steamed', 'chinese'],
    image: 'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1'
  },
  {
    name: 'Chicken Momos',
    price: 70,
    category: 'Snacks',
    stockQuantity: 18,
    isVegetarian: false,
    tags: ['chicken', 'chinese'],
    image: 'https://t4.ftcdn.net/jpg/15/64/99/81/240_F_1564998148_yTJhd1rBPxg3Prjw5WU4hz80Dmx9Dsci.jpg'
  },
  {
    name: 'Pani Puri',
    price: 30,
    category: 'Snacks',
    stockQuantity: 40,
    isVegetarian: true,
    tags: ['street food', 'chat'],
    image: 'https://t4.ftcdn.net/jpg/09/59/37/91/240_F_959379170_gMzOC7cnZpaFo9CvQNtIEhpbI7B21Atn.jpg'
  },
  {
    name: 'Bread Pakoda',
    price: 30,
    category: 'Snacks',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['bread', 'fried'],
    image: 'https://t4.ftcdn.net/jpg/04/31/54/51/240_F_431545125_CsveDrlLHKvTjw37auwtddHvUnaK4n27.jpg'
  },
  {
    name: 'Coffee',
    price: 20,
    category: 'Drinks',
    stockQuantity: 40,
    isVegetarian: true,
    tags: ['hot', 'coffee'],
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'
  },
  {
    name: 'Milk',
    price: 20,
    category: 'Drinks',
    stockQuantity: 30,
    isVegetarian: true,
    tags: ['hot', 'healthy'],
    image: 'https://t4.ftcdn.net/jpg/02/97/14/83/240_F_297148349_lEPXSzxqNO8MIyAqdXMEgfQkamgzu2WW.jpg'
  },

  // ❄ COLD DRINKS
  {
    name: 'Lemon Juice',
    price: 25,
    category: 'Drinks',
    stockQuantity: 35,
    isVegetarian: true,
    tags: ['cold', 'refreshing'],
    image: 'https://t4.ftcdn.net/jpg/03/85/08/83/240_F_385088345_7eKXj9AqlHjra1k30rFJqPvp2mTu3YX1.jpg'
  },
  {
    name: 'Watermelon Juice',
    price: 30,
    category: 'Drinks',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['cold', 'fruit'],
    image: 'https://t3.ftcdn.net/jpg/01/91/20/98/240_F_191209883_Ayn2KXj526thGEpOTQe7evF9N6lnXA2Y.jpg'
  },
  {
    name: 'Rose Milk',
    price: 30,
    category: 'Drinks',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['cold', 'sweet'],
    image: 'https://t3.ftcdn.net/jpg/17/31/49/78/240_F_1731497870_UstJab2KW9iLq5ejNvXVKnCQRzI6e9au.jpg'
  },
  {
    name: 'Butter Milk',
    price: 20,
    category: 'Drinks',
    stockQuantity: 40,
    isVegetarian: true,
    tags: ['cold', 'south indian'],
    image: 'https://t3.ftcdn.net/jpg/05/58/67/28/240_F_558672855_72WOIjUnO2XGwibjvZgichfD8QPU65DD.jpg'
  },

  // 🍦 ICE CREAMS
  {
    name: 'Vanilla Ice Cream',
    price: 40,
    category: 'Ice Cream',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['ice cream', 'vanilla'],
    image: 'https://t4.ftcdn.net/jpg/02/01/42/95/240_F_201429565_cRgdYjavKZC7h9H6OwuYfY2jlIi368PY.jpg'
  },
  {
    name: 'Chocolate Ice Cream',
    price: 45,
    category: 'Ice Cream',
    stockQuantity: 18,
    isVegetarian: true,
    tags: ['ice cream', 'chocolate'],
    image: 'https://t3.ftcdn.net/jpg/05/93/07/06/240_F_593070619_uLMSjzAsSPzkjRD2BDluplX1UqLL7nBO.jpg'
  },
  {
    name: 'Strawberry Ice Cream',
    price: 45,
    category: 'Ice Cream',
    stockQuantity: 18,
    isVegetarian: true,
    tags: ['ice cream', 'strawberry'],
    image: 'https://t3.ftcdn.net/jpg/02/08/29/74/240_F_208297411_hcQZ8TczTzkPA3Q3ZYwhPnV1hy1u5xDd.jpg'
  },
  {
    name: 'Butterscotch Ice Cream',
    price: 50,
    category: 'Ice Cream',
    stockQuantity: 15,
    isVegetarian: true,
    tags: ['ice cream', 'butterscotch'],
    image: 'https://t4.ftcdn.net/jpg/18/61/01/63/240_F_1861016301_m6dELoZd6X389GN4hkHnYWoHvVE2doUu.jpg'
  },
  {
    name: 'Kulfi',
    price: 35,
    category: 'Ice Cream',
    stockQuantity: 20,
    isVegetarian: true,
    tags: ['indian', 'kulfi'],
    image: 'https://t4.ftcdn.net/jpg/16/86/30/85/240_F_1686308503_0AyB096ZVcA2mo0FWL2GbqWRYxzwxMAl.jpg'
  },
  // 🥗 VEG SIDE DISHES
  {
    name: 'Vegetable Kurma',
    price: 30,
    category: 'Side Dish',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['veg', 'gravy'],
    image: 'https://t3.ftcdn.net/jpg/18/43/82/66/240_F_1843826668_KVogdWvWd5svUsrOeC4blx4CAAEW50oe.jpg'
  },
  {
    name: 'Potato Masala',
    price: 25,
    category: 'Side Dish',
    stockQuantity: 30,
    isVegetarian: true,
    tags: ['potato', 'dry'],
    image: 'https://t3.ftcdn.net/jpg/16/65/13/90/240_F_1665139091_GtydF1FCEkGjT7VMXdCtxdbaLtAKt2Gx.jpg'
  },
  {
    name: 'Channa Masala',
    price: 35,
    category: 'Side Dish',
    stockQuantity: 22,
    isVegetarian: true,
    tags: ['chickpea', 'protein'],
    image: 'https://t4.ftcdn.net/jpg/06/98/51/07/240_F_698510791_vBj6qSLQaQd6WiGbXKrGHp8MoAx1SsLP.jpg'
  },
  {
    name: 'Paneer Gravy',
    price: 45,
    category: 'Side Dish',
    stockQuantity: 18,
    isVegetarian: true,
    tags: ['paneer', 'rich'],
    image: 'https://t4.ftcdn.net/jpg/07/27/22/19/240_F_727221901_pYUxK4G1WZKHHmz2qHikfPLaBJC3UTQp.jpg'
  },
  {
    name: 'Mix Veg Curry',
    price: 30,
    category: 'Side Dish',
    stockQuantity: 25,
    isVegetarian: true,
    tags: ['mixed veg', 'healthy'],
    image: 'https://t4.ftcdn.net/jpg/10/04/04/27/240_F_1004042755_rhkRQbBn37ebRQeB7JNyRo1FCv9hARxg.jpg'
  },

  // 🍗 NON-VEG SIDE DISHES
  {
    name: 'Chicken Curry',
    price: 50,
    category: 'Side Dish',
    stockQuantity: 20,
    isVegetarian: false,
    tags: ['chicken', 'gravy'],
    image: 'https://t3.ftcdn.net/jpg/03/33/04/02/240_F_333040259_XAngCfVMVrmZbJXD3fqH4DVhMaTK7KbV.jpg'
  },
  {
    name: 'Chicken 65',
    price: 70,
    category: 'Side Dish',
    stockQuantity: 15,
    isVegetarian: false,
    tags: ['chicken', 'fried'],
    image: 'https://t3.ftcdn.net/jpg/17/71/98/70/240_F_1771987035_FdgkWBBE9nm4Y7Zv6rvCYMWiioci390F.jpg'
  },
  {
    name: 'Egg Curry',
    price: 40,
    category: 'Side Dish',
    stockQuantity: 20,
    isVegetarian: false,
    tags: ['egg', 'gravy'],
    image: 'https://t3.ftcdn.net/jpg/08/05/63/90/240_F_805639071_BfNwLfTiFN7zcyEs0gZLatSpW47UwIiw.jpg'
  },
  {
    name: 'Fish Fry',
    price: 80,
    category: 'Side Dish',
    stockQuantity: 12,
    isVegetarian: false,
    tags: ['fish', 'fried'],
    image: 'https://t4.ftcdn.net/jpg/17/57/65/79/240_F_1757657919_51oN41N9TPsk9JcWxAlPGH9nUUmgcsoD.jpg'
  },
  {
    name: 'Mutton Gravy',
    price: 90,
    category: 'Side Dish',
    stockQuantity: 10,
    isVegetarian: false,
    tags: ['mutton', 'spicy'],
    image: 'https://t3.ftcdn.net/jpg/06/34/46/16/240_F_634461620_IIdljjhoeqIQcL6YmvFCl55wxLd4uSvw.jpg'
  }
];

const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-canteen';

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing food items
    await Food.deleteMany({});
    console.log('🗑️  Cleared existing food items');

    // Insert seed data
    await Food.insertMany(foodItems);
    console.log(`✅ Inserted ${foodItems.length} food items`);

    // Display categories
    const categories = await Food.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('\n📊 Food items by category:');
    categories.forEach((cat) => {
      console.log(`  - ${cat._id}: ${cat.count} items`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
