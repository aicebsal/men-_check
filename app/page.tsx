"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  ShoppingBasket, 
  Heart, 
  UtensilsCrossed, 
  Sparkles, 
  Trash2, 
  Plus, 
  Search, 
  LogOut, 
  Settings, 
  Bot, 
  Bell, 
  User, 
  Apple, 
  Milk, 
  X, 
  Check, 
  Star, 
  Clock, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  HelpCircle, 
  ChefHat, 
  Package, 
  Info,
  Send,
  Lock,
  Volume2,
  VolumeX
} from "lucide-react";

// --- Types & Interfaces ---
interface ShoppingItem {
  id: string;
  name: string;
  category: "Frutas y Verduras" | "Lácteos y Huevos" | "Otros";
  quantity: string;
  checked: boolean;
}

interface PantryItem {
  id: string;
  name: string;
  emoji: string;
  statusText: string;
  percent: number;
  addedToList: boolean;
}

interface Recipe {
  id: string;
  title: string;
  category: "Desayuno" | "Almuerzo" | "Cena" | "Saludable" | "Confort";
  stars: number;
  time: number;
  image: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}
// --- Pure Unique ID generator defined outside the component to satisfy purity linting rules ---
let idCounter = 0;
function makeUniqueId(prefix: string): string {
  idCounter++;
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${idCounter}-${rand}`;
}

export default function Home() {
  // Navigation & Screen View state
  const [view, setView] = useState<"splash" | "login" | "dashboard" | "shopping-list" | "assistant">("splash");
  
  // User profile simulated state
  const [user, setUser] = useState<{ name: string; email: string; loggedIn: boolean }>({
    name: "Ainhoa Cebrián",
    email: "ainhoacebrian@consolacionburriana.com",
    loggedIn: false
  });

  // Login Form input state
  const [loginEmail, setLoginEmail] = useState("hola@familia.com");
  const [loginPassword, setLoginPassword] = useState("••••••••");

  // Filter and Search states for recipes
  const [recipeSearch, setRecipeSearch] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("Todos");

  // Selected Recipe detail Modal
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Speech synthesis audio reader status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null); // null if not speaking, -1 for full description/ingredients, 0...N for specific step N

  // Ensure speech synthesis cancels immediately when the modal is closed or changed
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Defer the state updates to next event loop cycle to avoid synchronous React render cascade warnings
    const timer = setTimeout(() => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedRecipe]);

  // Shopping List dynamic items state
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { id: "1", name: "Manzanas Royal Gala", category: "Frutas y Verduras", quantity: "6 unidades", checked: false },
    { id: "2", name: "Espinacas frescas", category: "Frutas y Verduras", quantity: "2 bolsas de 300g", checked: false },
    { id: "3", name: "Leche Semidesnatada", category: "Lácteos y Huevos", quantity: "Pack 6L", checked: false },
    { id: "4", name: "Yogurt Griego Natural", category: "Lácteos y Huevos", quantity: "Pack x4", checked: true },
  ]);

  // New item adding box temp variables
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<"Frutas y Verduras" | "Lácteos y Huevos" | "Otros">("Frutas y Verduras");
  const [newItemQuantity, setNewItemQuantity] = useState("1 unidad");

  // Pantry Items Mode
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([
    { id: "p1", name: "Arroz Basmati", emoji: "🍚", statusText: "Queda ~20%", percent: 20, addedToList: false },
    { id: "p2", name: "Pasta Penne", emoji: "🍝", statusText: "Queda ~10%", percent: 10, addedToList: false },
    { id: "p3", name: "Café Molido", emoji: "☕", statusText: "Stock suficiente", percent: 90, addedToList: false },
  ]);

  // Chat/Assistant with Gemini API state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "bot",
      text: "¡Hola! Soy tu asistente de Menú Check. ¿Qué te gustaría cocinar hoy? Puedo proponerte recetas personalizadas con lo que tengas en el refrigerador.",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sparkles list for splash background effects
  const [sparkles, setSparkles] = useState<Array<{ id: number; top: number; left: number; color: string; size: number }>>([]);

  // Favorite recipes tracking list
  const [favorites, setFavorites] = useState<string[]>([]);

  // --- Recipes database (expanded gourmet catalog for maximum variety and search relevancy) ---
  const recipes: Recipe[] = [
    {
      id: "r1",
      title: "Bowl Vitalidad Arcoíris",
      category: "Cena",
      stars: 4.8,
      time: 20,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaIGT4lNeuLRWL8-hWhZVOlc5rOM1LUIiJQQhpIRuZahEXBBhq7YDTPno1qUHgC9jeN8NMOL101Jd7l363sSCoqvMn6by-pTCrpaYqFWJupCauHzns1fsHqJKpjLrL5TptzDhahj07li5rhYCD2xnhtfQtfFm5RvoSGsPyTCwfGZACaNv8_RG_C-iX8O56maGl2jias9GtQJ8ShJ3tlOVZcmFZLUG4Lm3RRF41-HAKBt2McCiXvuDmdTEV8ebhAOWB5e4_vUUn5Jhi",
      description: "Una base de quinoa con vegetales asados y un toque de crema de cacahuete suave.",
      ingredients: ["3/4 taza de quinoa cocida", "1/2 aguacate maduro", "1/2 calabacín asado", "1/2 taza de tomates cherry", "1 cucharada de semillas de sésamo", "Aderezo: crema de cacahuete, limón y soja baja en sodio"],
      steps: [
        "Enjuagar y cocer la quinoa según instrucciones del paquete.",
        "Asar en sartén con gotas de aceite de oliva el calabacín y los tomates cherry ligeramente salpimentados.",
        "Emplatar en un bol colocando la quinoa como base.",
        "Distribuir los vegetales asados, el aguacate fileteado y las espinacas frescas encima.",
        "Rociar con el aderezo de cacahuete emulsionado con un chorrito de agua caliente and limón.",
        "Decorar con las semillas de sésamo por encima para ese toque crunchy familiar."
      ]
    },
    {
      id: "r2",
      title: "Pizza Artesana Margarita",
      category: "Almuerzo",
      stars: 4.5,
      time: 45,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuVaimHKbqnSqlMCFTCgLsyQssXGT5E6b7kwuxywxc8iXaMxdx4kXUZ97_iC3g8wEQ0VrqVHZOAX75MwH8SOXih8psXsuxbj8_vdGrhtPluEWTys_0eusjGW83UxsOCAbz49UnMTEmf7NRc9JiItPeC43z3W2ys2EGT9iYVjRlicD5Run5BN2pmsvmgo_Z9Hsl4mKzZ28L3drLB1lfApgwjl-ZBDpMdzW-V-ltzBtFPBD09WRM6HtmrYaYJQlWD0xQkRzK8TYIdmae",
      description: "Masa madre crujiente con tomate San Marzano y mozzarella de búfala fresca.",
      ingredients: ["250g de masa de pizza con masa madre", "100ml de salsa de tomate San Marzano", "125g de mozzarella de búfala fresca", "Hojas de albahaca fresca del huerto", "1 cucharidita de aceite de oliva virgen extra"],
      steps: [
        "Precalentar el horno a máxima potencia (al menos 230°C o en modo pizza si tu horno dispone de él).",
        "Estirar la masa con las manos sobre papel de hornear, dejando los bordes ligeramente más gruesos para que queden esponjosos.",
        "Extender la salsa de tomate de manera uniforme desde el centro.",
        "Trocear la mozzarella de búfala (bien escurrida para que no suelte líquido) por encima.",
        "Hornear de 10 a 12 minutos hasta que los bordes adquieran un dorado crujiente de pizzería clásica.",
        "Al retirar del horno, colocar las hojas de albahaca fresca entera y verter el hilo de aceite virgen."
      ]
    },
    {
      id: "r3",
      title: "Salmón al Limón & Espárragos",
      category: "Saludable",
      stars: 5.0,
      time: 15,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAygqtdavRhJs6VW_BWwtSEAIH67GtPffEYGiT0FEllrWk9Hr3VRXFpAu3Yht7w8yeXsnk1pLCVQD882u162jkaTuocOWkgFSt8Z0BTH6sZmE2H3N9JhEAFmhLbEaXK8p1dP69hDLhed8tHimyPkAaBj8KFQqURbGRZ5oZUhUUrGdLxdt12Fwuq801MdwB55X4-NNvfrTFHn6Ae0-Z6CjCuwrv4oK85aqjz2q5ulqv9_09BlJm5q3wk3PmaA6f53ba6NP1aU2KW0lUB",
      description: "Salmón fresco sellado a la plancha con una guarnición de espárragos trigueros al dente.",
      ingredients: ["2 rodajas de lomo de salmón fresco", "1 manojo de espárragos trigueros finos", "1 limón entero orgánico", "1 rama de eneldo fresco", "Sal en escamas", "Pizca de pimienta recién molida"],
      steps: [
        "Retirar la parte dura de los espárragos cortando la base fibrosa.",
        "Calentar la plancha o sartén con unas gotas de aceite. Sellar los espárragos por unos 5 minutos girándolos hasta que queden tiernos.",
        "Sazonar el salmón con sal en escamas y pimienta negra.",
        "En la misma sárten o plancha bien caliente, colocar el salmón primero por el lado de la piel. Mantener durante 4 minutos sin mover para que quede crujiente.",
        "Dar la vuelta con cuidado y cocinar otros 2 o 3 minutos, agregando rodajas finas de limón en la plancha.",
        "Servir caliente decorado con eneldo y unas gotas de limón fresco exprimido."
      ]
    },
    {
      id: "r4",
      title: "Ensalada de Verano Citrus",
      category: "Cena",
      stars: 4.2,
      time: 10,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFDpn5pYFozRu5Fld8xHi1U_rGQAomzrC23zdeLD8sLY357uUAWrywGoX5g4udkW6qkX9_a8z56En4vbAy2Ktg-iddDRfB9Zr7A8rHAamye557319zMJ4RCXFypbECt30yhg97QePiVBXD1beJ2mYfdwtzthCB2CJMJSd-5828kX7tUGUiJq5Bl5oGMDRXpkGYyjLoX8waCSQfqwGW_4JbqrT3zzLVkc7avcjlBaxNjwdszA1HTrGJgAUHekWmYCh0z3YJglLACR4q",
      description: "Mix de hojas verdes con cítricos, nueces y un aliño refrescante de miel y mostaza.",
      ingredients: ["200g de mix de brotes verdes", "1 naranja dulce fileteada en gajos", "1/2 taza de nueces pecanas tostadas", "50g de rulo de cabra desmenuzado", "Aderezo: 2 cdas de aceite de oliva, 1 cda de vinagre de manzana, 1 cdita de miel de flores y 1/2 cdita de mostaza Dijon"],
      steps: [
        "Lavar y escurrir muy bien los brotes de hojas verdes.",
        "Pelar la naranja a saco (eliminando toda la piel blanca) y cortar los gajos limpios con un cuchillo afilado.",
        "Tostar las nueces un minuto en la sartén sin aceite para potenciar su aroma aromático.",
        "En un frasco pequeño, agitar enérgicamente todos los ingredientes del aderezo cítrico hasta emulsionar.",
        "En una ensaladera ancha colocar las hojas, los gajos de naranja y el queso desmenuzado.",
        "Regar con el aderezo justo antes de sentarse a la mesa y espolvorear las nueces pecanas tostadas."
      ]
    },
    {
      id: "r5",
      title: "Tostada Aguacate & Huevo",
      category: "Desayuno",
      stars: 4.9,
      time: 12,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV3EvoeL0ijt6GST54_woaxbcba6g7H1VlFAw55JVl3_v_cbJcaY6oQFEAstlzIrkEcwUQMhVkqgjL3S6H68UISK621vrzjOkse_l7PsAXAijHCUPrPd2mmDiBLxjTO_7Q_EMD_4BTnmNa3y_q-BQo7olXrS363Ihp1AT4iZ6RW2UYhoV_0OBKJBY6rfPWtNF2RCxkfifjvPYsivQpQe7RnkDsT-mw3yiNaTeJCIpKo9f3Dr0ffcSjPHZ5kLWjUXvMJbtKBdxwWMpv",
      description: "Pan de espelta integral con aguacate triturado, huevo poché y semillas de sésamo.",
      ingredients: ["2 rebanadas de pan de espelta integral", "1 aguacate maduro", "2 huevos camperos frescos", "1 cucharada de vinagre blanco", "Sal rosa del Himalaya", "Mezcla de semillas (chía, sésamo, calabaza)", "Copos de chile rojo (opcional)"],
      steps: [
        "Tostar las rebanadas de pan de espelta integral al gusto hasta conseguir un color tostado uniforme.",
        "Pelar el aguacate, retirar el hueso y machacarlo con un tenedor en un bol agregando unas gotitas de limón para que no se oxide y una pizca de sal.",
        "Para el huevo poché: Hervir abundante agua en una ola pequeña con el vinagre. Cuando hierva a fuego suave, girar el agua para formar un remolino e introducir el huevo crudo deslizado despacio. Cocinar por 3 minutos exactos y retirar con una espumadera.",
        "Montar la tostada untando con generosidad el cremoso de aguacate.",
        "Colocar encima el huevo poché caliente bien escurrido.",
        "Decorar con la mezcla de semillas y opcionalmente copos de chile para los adultos."
      ]
    },
    {
      id: "r6",
      title: "Crema de Tomate Rostizado",
      category: "Confort",
      stars: 4.6,
      time: 30,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrg2fpB6RKpcQk7W2xlut1vkX6k2I4GY6irTJ-OTahJU9Cg6G8EkuOrUOT31ZiXtdz3fP9M558U6kX8pA_R1iT3vk8tBw-vvySJWzuSO4LpTqzy5Nxr0ChhH7wAjLW_yXsAH4iW6TKqon3-JUA67y2Ow-R5HtBs_0WEQuFx5Zn4wQiXM8L2tTkFwuNar1wyBfPJwL9XK5yoZGmz_LT-xI2PQPHTmrD43QAUkZe9PbnMDKZgBDXhUkVicQGPf0CpMP2Xbm6iPs2mQ28",
      description: "Sopa cremosa de tomates horneados lentamente con albahaca y aceite de oliva virgen.",
      ingredients: ["800g de tomates maduros tipo rama", "1 cebolla morada mediana", "3 dientes de ajo enteros", "1 cda de aceite de oliva", "100ml de caldo de verduras orgánico", "50ml de leche de coco o yogur griego para cremosidad", "Hojas de albahaca fresca"],
      steps: [
        "Precalentar el horno a 200°C.",
        "Disponer en una placa para horno los tomates cortados por la mitad, los dientes de ajo enteros con piel y la cebolla morada en gajos grandes. Regar todo con aceite de oliva, sal y pimienta.",
        "Hornear por 25 minutos hasta que los tomates estén caramelizados con los bordes deliciosamente asados.",
        "Pelar los ajos asados que habrán quedado cremosos.",
        "Introducir todos los ingredientes rostizados de la placa en una licuadora o triturador, vertiendo el caldo de verduras caliente y la crema de coco.",
        "Triturar hasta obtener una sopa ultra fina. Servir caliente, decorando con hojas frescas de albahaca fresca y acompañando opcionalmente de tostadas con queso."
      ]
    },
    {
      id: "r7",
      title: "Tortitas de Avena y Plátano",
      category: "Desayuno",
      stars: 4.7,
      time: 15,
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
      description: "Tortitas esponjosas sin azúcar añadida, endulzadas de forma natural con plátano maduro.",
      ingredients: ["1 plátano maduro grande", "1/2 taza de copos de avena triturados", "1 huevo entero campero", "1/4 taza de leche o bebida vegetal", "1 cucharadita de canela molida", "1 puñado de arándanos frescos"],
      steps: [
        "Triturar el plátano maduro en un bol hasta conseguir un puré homogéneo.",
        "Añadir el huevo entero y batir enérgicamente con el puré de plátano.",
        "Incorporar la avena molida, la canela y la leche, mezclando hasta obtener una masa densa pero fluida.",
        "Calentar una sartén antiadherente a fuego medio con unas gotas de aceite de coco o mantequilla.",
        "Verter porciones de masa para formar las tortitas, cocinando de 2 a 3 minutos por lado hasta que salgan burbujas en la superficie.",
        "Servir calientes con arándanos frescos por encima y un toque opcional de miel pura."
      ]
    },
    {
      id: "r8",
      title: "Risotto de Setas Silvestres",
      category: "Confort",
      stars: 4.9,
      time: 35,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600",
      description: "Cremoso risotto italiano con una selección gourmet de setas, vino blanco y queso parmesano.",
      ingredients: ["300g de arroz carnaroli o arborio", "200g de setas variadas (boletus, champiñones, portobello)", "1 cebolleta fresca", "100ml de vino blanco seco", "1L de caldo de verduras caliente", "55g de mantequilla sin sal", "50g de queso parmesano rallado", "Aceite de trufa (opcional)"],
      steps: [
        "Limpiar las setas y picarlas en trozos medianos. Rehogar en una cazuela ancha con un hilo de aceite hasta dorar y reservar.",
        "En la misma cazuela, derretir la mitad de la mantequilla y sofreír la cebolleta finamente picada a fuego lento.",
        "Añadir el arroz y nacrarlo por 2 minutos hasta que brille.",
        "Verter el vino blanco y dejar que se evapore por completo el alcohol.",
        "Ir incorporando el caldo de verduras caliente cazo a cazo, removiendo continuamente para liberar el almidón del arroz.",
        "Tras 17 minutos de cocción, cuando esté al dente, añadir las setas reservadas, retirar del fuego e incorporar la mantequilla restante y el queso parmesano para amantecar.",
        "Dejar reposar 2 minutos y coronar con un suave hilo de aceite de trufa para los comensales."
      ]
    },
    {
      id: "r9",
      title: "Tacos de Pollo al Chipotle",
      category: "Almuerzo",
      stars: 4.6,
      time: 20,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=600",
      description: "Tacos mexicanos tradicionales con pollo deshebrado en una salsa sabrosa y ligeramente picante de chile chipotle.",
      ingredients: ["400g de pechuga de pollo cocida y deshebrada", "1 cebolla cortada en juliana", "2 tomates medianos licuados", "1 chile chipotle en adobo", "8 tortillas de maíz de buena calidad", "Cilantro fresco y gajos de lima", "1/2 taza de crema agria de mesa"],
      steps: [
        "Sofreír la cebolla en juliana en una sartén con aceite hasta caramelizar a fuego medio.",
        "Licuar los tomates con el chile chipotle y verter sobre la sartén.",
        "Añadir el pollo deshebrado, mezclar bien con la salsa de tomate y chipotle, y dejar cocinar a fuego lento durante 8-10 minutos hasta reducir.",
        "Calentar las tortillas de maíz en un comal o sartén caliente por ambos lados.",
        "Rellenar las tortillas calientes con la mezcla sazonada de pollo deshebrado.",
        "Servir con abundante cilantro picado, un chorrito de crema agria y gajos de lima para exprimir al momento."
      ]
    },
    {
      id: "r10",
      title: "Lasaña Vegetariana de Espinacas",
      category: "Confort",
      stars: 4.8,
      time: 40,
      image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=600",
      description: "Capas de pasta rellenas de espinacas frescas salteadas, queso ricotta cremoso y salsa de tomate casera.",
      ingredients: ["12 láminas de pasta para lasaña precocidas", "400g de espinacas frescas", "250g de queso ricotta o requesón", "300ml de salsa de tomate casera", "200ml de bechamel suave", "100g de queso mozzarella rallado", "Aceite de oliva y nuez moscada"],
      steps: [
        "Blanquear o saltear las espinacas frescas en sartén con un poco de ajo por 3 minutos. Escurrir muy bien para extraer el exceso de agua.",
        "En un cuenco, mezclar las espinacas con el queso ricotta, sal, pimienta negra y una pizca aromática de nuez moscada.",
        "En una fuente de horno rectangular, poner un chorrito de tomate casero en la base.",
        "Colocar una capa de pasta, luego la mezcla de crema de espinacas y ricotta, otra de pasta y tomate, repitiendo el proceso.",
        "Terminar con una capa de pasta cubierta con bechamel suave y mozzarella rallada.",
        "Hornear a 180°C durante 20-25 minutos hasta que la superficie esté dorada y haga burbujas de queso gratinado delicioso."
      ]
    },
    {
      id: "r11",
      title: "Hamburguesa Gourmet de Ternera",
      category: "Almuerzo",
      stars: 4.7,
      time: 15,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
      description: "Carne selecta de ternera picada en pan brioche artesano con queso cheddar fundido y cebolla pochada.",
      ingredients: ["2 hamburguesas de carne de ternera picada de 180g", "2 panes brioche de panadería", "2 rodajas de queso cheddar añejo de calidad", "1 cebolla pochada lentamente con mantequilla", "Hojas de lechuga roble o espinaca tierna", "Salsa casera: mostaza clásica y compota suave de higos"],
      steps: [
        "Calentar una plancha a fuego muy alto.",
        "Hacer los panes brioche cortados por la mitad sobre la plancha con un toque suave de mantequilla hasta dorar ligeramente.",
        "Cocinar la carne de ternera en la plancha durante 3 minutos por lado para que quede tierna y jugosa al centro.",
        "Colocar la rodaja de queso cheddar encima de la carne caliente el último minuto agregando unas gotas de agua en la plancha para vaporizar y fundir perfectamente.",
        "Armar la hamburguesa colocando en la base de pan brioche los brotes, luego la carne fundida.",
        "Coronar con cebolla caramelizada pochada y la salsa de mostaza e higos antes de tapar con el brioche."
      ]
    },
    {
      id: "r12",
      title: "Gazpacho Andaluz Tradicional",
      category: "Saludable",
      stars: 4.8,
      time: 10,
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600",
      description: "Clásica y refrescante sopa fría de tomates pera bien maduros, pepino y aceite de oliva virgen extra.",
      ingredients: ["1kg de tomates pera maduros", "1/2 pimiento verde italiano", "1/2 pepino pelado", "1 diente de ajo pequeño (sin el germen interior)", "50ml de aceite de oliva virgen extra de alta calidad", "2 cucharadas de vinagre de Jerez", "Pizca de sal", "Agua fría al gusto"],
      steps: [
        "Lavar perfectamente todos los ingredientes frescos del campo.",
        "Colocar en el vaso de la licuadora o trituradora potente los tomates enteros pelados, el pimiento troceado, el pepino y el ajo.",
        "Triturar a máxima potencia durante varios minutos hasta conseguir una emulsión fina.",
        "Añadir el aceite de oliva poco a poco mientras se bate para ligar la mezcla, junto con la sal y el vinagre de Jerez.",
        "Pasar la crema por un colador chino para retirar restos finos de pieles.",
        "Refrigerar al menos 2 horas antes de servir para disfrutarlo helado en tazas o vasos de cristal."
      ]
    },
    {
      id: "r13",
      title: "Gnocchi de Calabaza con Salvia",
      category: "Confort",
      stars: 4.5,
      time: 25,
      image: "https://images.unsplash.com/photo-1621996346565-e3bb627add2e?auto=format&fit=crop&q=80&w=600",
      description: "Gnocchis italianos hechos de calabaza asada, acompañados de una salsa ligera de mantequilla noisette y hojas de salvia crujiente.",
      ingredients: ["400g de gnocchis de calabaza de buena calidad", "40g de mantequilla pura cien por cien", "6-8 hojas de salvia fresca", "50g de queso pecorino o parmesano rallado al momento", "Pizca de pimienta negra ahumada", "20g de nueces pecanas tostadas troceadas"],
      steps: [
        "Hervir abundante agua con sal en una cazo grande e introducir los gnocchi de calabaza.",
        "Cocinar los gnocchi hasta que suban a la superficie, señal de que están listos, y escurrir reservando un cazo de agua caliente de cocción.",
        "Mientras tanto, calentar una sárten a fuego medio y derretir la mantequilla lentamente hasta que empiece a dorarse y huela a nuez (mantequilla noisette).",
        "Añadir las hojas de salvia a la mantequilla hasta que queden un poco fritas y crujientes.",
        "Incorporar los gnocchi escurridos a la sartén junto con el chorrito de agua de cocción para ligar una salsa untuosa.",
        "Servir inmediatamente con el queso pecorino rallado y las nueces tostadas crujientes por encima."
      ]
    },
    {
      id: "r14",
      title: "Wok de Fideos y Ternera",
      category: "Almuerzo",
      stars: 4.7,
      time: 20,
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600",
      description: "Fideos udon salteados al fuego vivo en wok con tiras de ternera marinada, brócoli, pimientos y salsa de sésamo.",
      ingredients: ["250g de fideos udon o soba listos", "200g de lomo de ternera fileteado en tiras", "1/2 taza de flores de brócoli", "1/2 pimiento rojo cortado en tiras", "Salsa wok: 3 cdas de salsa de soja, 1 cda de aceite de sésamo refinado, 1 diente de ajo rallado y canela molida"],
      steps: [
        "Marinar las finas tiras de ternera con el diente de ajo rallado y un poco de salsa de soja por 10 minutos.",
        "Preparar los fideos udon según sea de hidratarlos y escurrir.",
        "Calentar al máximo de potencia el wok tradicional o sartén honda con una cucharada de aceite.",
        "Saltear la carne de ternera a fuego muy vivo durante unos 3 minutos hasta dorar y retirar.",
        "En el mismo wok caliente, añadir el brócoli y pimiento salteándolos 3-4 minutos para que queden tiernos.",
        "Volver a introducir la carne, verter los fideos calientes y regar con el tarro de salsa de sésamo de la casa."
      ]
    },
    {
      id: "r15",
      title: "Chia Pudding de Frutos Rojos",
      category: "Desayuno",
      stars: 4.6,
      time: 10,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600",
      description: "Un pudin saludable hecho a base de semillas de chía hidratadas en leche de almendras, cubierto con mermelada rápida de frambuesa.",
      ingredients: ["3 cucharadas de semillas de chía orgánicas", "150ml de leche de almendras sin azúcar", "1 cucharadita de extracto de vainilla natural", "1 cucharadita de jarabe de agave puro", "1/2 taza de frambuesas y fresas frescas molidas", "Unas ramitas de menta fresca"],
      steps: [
        "En un bote de vidrio, mezclar con esmero las semillas de chía con la leche de almendras, vainilla y sirope de agave.",
        "Dejar reposar 10 minutos en la encimera y volver a mezclar para evitar grumos.",
        "Tapar el envase y mantener refrigerando mínimo 4 horas, idealmente toda la noche, para que el mucílago de la chía espese.",
        "Preparar un puré rápido de fruta machacando con tenedor las frambuesas y las fresas.",
        "Servir en una taza transparente sirviendo el pudin de chía cuajado y coronando con la salsa de frutos rojos.",
        "Pasar la menta fresca para decorar antes del disfrute por la mañana."
      ]
    },
    {
      id: "r16",
      title: "Dorada al Horno Panadera",
      category: "Cena",
      stars: 4.9,
      time: 30,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600",
      description: "Filete de dorada fresca horneado lentamente sobre una base de patatas panaderas tiernas y rodajas de cebolla dulce juliana.",
      ingredients: ["1 dorada limpia entera de la ría", "2 patatas medianas peladas", "1 cebolla dulce grande", "75ml de vino blanco de mesa", "50ml de aceite de oliva", "1 limón rodajas", "Sal y ajo en polvo"],
      steps: [
        "Cortar las patatas peladas en rodajas finas (panaderas) al igual que la cebolla en juliana.",
        "Precalentar el horno a 190°C con aire.",
        "Disponer las patatas y cebolla en una bandeja con aceite, sal y el vino blanco horneando por 15 minutos hasta ablandar.",
        "Hacer unos cortes finos en los lomos del pescado e introducir rodajas de limón en ellos.",
        "Sazonar el pescado y colocarlo sobre la cama de patatas precocidas.",
        "Hornear otros 12-15 minutos según espesor hasta que el pescado esté blanco y nacarado en su punto idóneo de hidratación."
      ]
    },
    {
      id: "r17",
      title: "Crema de Calabaza y Jengibre",
      category: "Saludable",
      stars: 4.7,
      time: 25,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=600",
      description: "Crema reconfortante repleta de nutrientes a base de calabaza butternut, zanahoria y un toque de jengibre fresco.",
      ingredients: ["600g de calabaza butternut pelada", "2 zanahorias grandes", "1 puerro y 1 patata mediana", "1 trocito pequeño de jengibre fresco rallado", "1 cucharada de aceite de oliva virgen extra", "Pizca de sal y pimienta blanca", "Semillas de calabaza para adornar"],
      steps: [
        "Trocear la calabaza, zanahorias, puerro y patata limpia.",
        "En una cazuela con aceite de oliva saltear el puerro y patata por 3 minutos.",
        "Incorporar la calabaza y zanahoria, cubriendo con agua caliente o caldo casero.",
        "Cocer a fuego medio por unos 20 minutos hasta que todos los ingredientes estén tiernos.",
        "Llevar al procesador añadiendo el trozo de jengibre de raíz rallado al instante, triturando hasta que se logre una crema fina.",
        "Servir templado coronado con semillas de calabaza tostadas y un hilo de aceite."
      ]
    },
    {
      id: "r18",
      title: "Hummus de Garbanzo con Pita",
      category: "Cena",
      stars: 4.8,
      time: 12,
      image: "https://images.unsplash.com/photo-1547058886-af77d90d5721?auto=format&fit=crop&q=80&w=600",
      description: "Crema de garbanzos cocidos tradicional con pasta tahini de sésamo, limón, ajo y pimentón ahumado.",
      ingredients: ["400g de garbanzos cocidos escurridos", "2 cucharadas soperas de crema Tahini de sésamo tostado", "1 cucharadita de comino molido", "1 chorrito de limón recién cortado", "1 cucharada de aceite de oliva virgen extra", "Agua helada al gusto", "Pan de pita integral para dipear"],
      steps: [
        "Enjuagar los garbanzos cocidos bajo chorro de agua fría.",
        "Introducir en el vaso batidor los garbanzos escurridos con la pasta de tahini, el limón, comino y una de sal.",
        "Licuar añadiendo el ajo y un piquito de agua helada que ayudará a conseguir una de textura sedosa.",
        "Emplatar alisando la superficie del hummus formando una silueta con la cuchara.",
        "Verter abundante aceite de oliva virgen extra y espolvorear pimentón ahumado por encima.",
        "Calentar el pan de pita en un tostador y cortar en triángulos para servir de acompañamiento inmediato."
      ]
    }
  ];

  // --- Initialize Client side localStorage data on Mount ---
  useEffect(() => {
    // Generate lovely initial client side sparkles list to make the landing look dazzling and organic
    const initialSparkles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      top: Math.random() * 80 + 10,
      left: Math.random() * 80 + 10,
      color: ["#a8d5ba", "#fecbcb", "#b1d865", "#ffdad9"][Math.floor(Math.random() * 4)],
      size: Math.random() * 10 + 6
    }));
    
    // Defer update slightly using timeout to guarantee pure effect checks
    setTimeout(() => {
      setSparkles(initialSparkles);
    }, 0);

    // Hydrate state from localStorage if available (wrapped asynchronously to avoid hydration mismatches and cascading render warnings)
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const storedList = localStorage.getItem("menucheck_shopping_list");
        if (storedList) {
          try {
            setShoppingList(JSON.parse(storedList));
          } catch (e) {
            console.error(e);
          }
        }

        const storedPantry = localStorage.getItem("menucheck_pantry");
        if (storedPantry) {
          try {
            setPantryItems(JSON.parse(storedPantry));
          } catch (e) {
            console.error(e);
          }
        }

        const storedFavorites = localStorage.getItem("menucheck_favorites");
        if (storedFavorites) {
          try {
            setFavorites(JSON.parse(storedFavorites));
          } catch (e) {
            console.error(e);
          }
        }

        const storedUser = localStorage.getItem("menucheck_user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (parsed.loggedIn) {
              setView("dashboard");
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 0);
  }, []);

  // Save Shopping List whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("menucheck_shopping_list", JSON.stringify(shoppingList));
    }
  }, [shoppingList]);

  // Save Pantry list whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("menucheck_pantry", JSON.stringify(pantryItems));
    }
  }, [pantryItems]);

  // Save Favorites whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("menucheck_favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);


  // --- Helper Methods & Event Handlers ---

  // Toggle favorite state of a recipe
  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId) 
        : [...prev, recipeId]
    );
  };

  // Convert text contents to human speech (audio loudspeaker function)
  const speakText = (text: string, index: number | null) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("La síntesis de voz no está soportada en este navegador.");
      return;
    }

    // Toggle logic: if we are already speaking this exact section, click to stop
    if (isSpeaking && speakingIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingIndex(null);
      return;
    }

    // Cancel current speaking
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; // Explicitly target Spanish matching app language

    // On start
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingIndex(index);
    };

    // On complete / finish
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    // On exception / error
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    // Play!
    window.speechSynthesis.speak(utterance);
  };

  // Handle standard simulated password log-in
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...user, loggedIn: true };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("menucheck_user", JSON.stringify(updated));
    }
    setView("dashboard");
  };

  // Google Login simulated bypass
  const handleGoogleLogin = () => {
    const updated = { ...user, loggedIn: true };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("menucheck_user", JSON.stringify(updated));
    }
    setView("dashboard");
  };

  // Simulated Log Out
  const handleLogOut = () => {
    const updated = { ...user, loggedIn: false };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("menucheck_user", JSON.stringify(updated));
    }
    setView("splash");
  };

  // Toggle Shopping List check state
  const toggleItemChecked = (id: string) => {
    setShoppingList(prev => 
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // Delete a Shopping List item
  const deleteItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  // Add custom typed item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: makeUniqueId("custom"),
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity,
      checked: false
    };

    setShoppingList(prev => [...prev, newItem]);
    setNewItemName("");
    setNewItemQuantity("1 unidad");
  };

  // Add a quick item from pantry view list
  const addPantryItemToShoppingList = (pantryId: string, name: string) => {
    // Check if it already exists to prevent duplication
    const exists = shoppingList.some(item => item.name.toLowerCase() === name.toLowerCase() && !item.checked);
    if (exists) {
      alert(`"${name}" ya se encuentra activo en tu lista de compra.`);
      return;
    }

    const newItem: ShoppingItem = {
      id: makeUniqueId("pantry-add"),
      name: name,
      category: "Otros",
      quantity: "1 unidad",
      checked: false
    };

    setShoppingList(prev => [...prev, newItem]);
    setPantryItems(prev => 
      prev.map(p => p.id === pantryId ? { ...p, addedToList: true } : p)
    );

    // Auto reset "added" notification shortly
    setTimeout(() => {
      setPantryItems(prev => 
        prev.map(p => p.id === pantryId ? { ...p, addedToList: false } : p)
      );
    }, 2000);
  };

  // Clear checked items to clear spacing clutter
  const handleClearCheckedItems = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  // Call the server side backend route to message Gemini API
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const userMsg: ChatMessage = {
      id: makeUniqueId("msg-u"),
      sender: "user",
      text: userText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      // Build brief chat history to keep context clean
      const apiHistory = chatMessages.slice(-4).map(m => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: apiHistory
        })
      });

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: makeUniqueId("msg-b"),
        sender: "bot",
        text: data.text || "Disculpa, obtuve una respuesta vacía del servidor.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMsg]);

    } catch (e: any) {
      console.error(e);
      const botErrorMsg: ChatMessage = {
        id: makeUniqueId("msg-err"),
        sender: "bot",
        text: "Uh oh, ha ocurrido un pequeño error al conectarme con el servidor local de IA. Por favor, asegúrate de tener conexión y de configurar tu API key si deseas respuestas personalizadas en tiempo real.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle hot-keyword suggestions for chat
  const handleSelectSuggestion = (text: string) => {
    setChatInput(text);
  };

  // Format current date nicely in Spanish for the daily menu
  const getFormattedTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  // Select daily dynamic recommended meals based on the current day's numeric date seed
  const getDailyRecommendations = (): Recipe[] => {
    if (!recipes || recipes.length === 0) return [];
    
    // Create a seed based on day, month, and year to ensure stable change every day
    const now = new Date();
    const daySeed = now.getDate() + now.getMonth() * 31 + (now.getFullYear() - 2026) * 365;
    
    const desayunos = recipes.filter(r => r.category === "Desayuno");
    const almuerzos = recipes.filter(r => r.category === "Almuerzo");
    const cenas = recipes.filter(r => r.category === "Cena" || r.category === "Confort");
    const saludables = recipes.filter(r => r.category === "Saludable");
    
    const recs: Recipe[] = [];
    
    if (desayunos.length > 0) {
      recs.push(desayunos[daySeed % desayunos.length]);
    }
    if (almuerzos.length > 0) {
      recs.push(almuerzos[(daySeed + 3) % almuerzos.length]);
    }
    if (cenas.length > 0) {
      recs.push(cenas[(daySeed + 7) % cenas.length]);
    } else if (saludables.length > 0) {
      recs.push(saludables[(daySeed + 13) % saludables.length]);
    }
    
    return recs;
  };

  const dailyRecipes = getDailyRecommendations();

  // Filter recipes based on category selection tag & search input text (including ingredients)
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(recipeSearch.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(recipeSearch.toLowerCase()) ||
                          recipe.ingredients.some(ing => ing.toLowerCase().includes(recipeSearch.toLowerCase()));
    
    const matchesCategory = activeCategoryFilter === "Todos" || 
                            (activeCategoryFilter === "Favoritos" ? favorites.includes(recipe.id) : recipe.category === activeCategoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-[1400px] mx-auto overflow-x-hidden md:px-4 lg:px-6">
      
      {/* -------------------------------------------------------------
          SCREEN VIEW 1: SPLASH LANDING VIEW
          ------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {view === "splash" && (
          <motion.main 
            key="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full min-h-[90vh] flex flex-col items-center justify-center relative p-6 bg-[#f0f2f5]"
          >
            {/* Sparkles background animation wrapper */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {sparkles.map((sp) => (
                <motion.div
                  key={sp.id}
                  className="absolute rounded-full"
                  style={{
                    top: `${sp.top}%`,
                    left: `${sp.left}%`,
                    width: sp.size,
                    height: sp.size,
                    backgroundColor: sp.id % 2 === 0 ? "#3498db" : "#2c3e50",
                    opacity: 0.3,
                    filter: "blur(0.5px)"
                  }}
                  animate={{
                    y: [0, -25, 0],
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: 4 + (sp.id % 4),
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Central Circle Graphics & Floating Icons (Matching Slide 1 Exactly in High Density theme!) */}
            <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">
              {/* Outer Pulse Circles */}
              <div className="absolute inset-0 border border-[#3498db]/25 rounded-full animate-[ping_4s_infinite] opacity-30" />
              <div className="absolute inset-4 border border-[#2c3e50]/20 rounded-full animate-[pulse_2.5s_infinite]" />
              <div className="absolute inset-10 border border-gray-300 rounded-full" />

              {/* Central Logo Sphere Container */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-40 h-40 md:w-48 md:h-48 rounded-full bg-[#2c3e50]/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white"
              >
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
                  <UtensilsCrossed className="text-[#2c3e50] w-16 h-16 md:w-20 md:h-20 stroke-[1.5]" />
                </div>
              </motion.div>

              {/* Sparkle Icons around sphere */}
              <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow border border-gray-100 text-[#3498db] animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Application Branding Identity */}
            <div className="text-center mt-10 space-y-4 max-w-md">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2c3e50] font-sans">
                Menú Check
              </h1>
              <p className="text-lg md:text-xl text-[#555a64] max-w-[320px] mx-auto font-normal leading-relaxed">
                Organización familiar con <span className="font-semibold text-[#3498db]">frescura y orden</span>.
              </p>
            </div>

            {/* Large Interactive circular CTA button in High Density accent style */}
            <div className="relative mt-12 group">
              {/* Floating icon highlights around main button */}
              <div className="absolute -top-4 -left-6 bg-blue-50/80 border border-blue-100 p-2.5 rounded-full shadow transform -rotate-12 transition-all duration-300">
                <ShoppingBasket className="text-[#3498db] w-5 h-5" />
              </div>
              <div className="absolute -bottom-2 -right-6 bg-slate-100 border border-slate-200 p-2.5 rounded-full shadow transform rotate-12 transition-all duration-300">
                <Heart className="text-[#2c3e50] w-5 h-5 fill-current" />
              </div>

              {/* Central Circle Start Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("login")}
                className="id_btn_start w-28 h-28 md:w-36 md:h-36 bg-[#2c3e50] hover:bg-[#34495e] text-white font-semibold text-lg md:text-xl rounded-full shadow-lg transition-all duration-300 flex items-center justify-center border-4 border border-white focus:outline-none"
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold tracking-wide">Inicio</span>
                  <ArrowRight className="w-5 h-5 mt-1 text-[#3498db] animate-pulse" />
                </div>
              </motion.button>
            </div>

            {/* Corner Decorative Ambient Blur shapes */}
            <div className="absolute top-0 left-0 w-36 h-36 bg-[#3498db]/10 rounded-br-full filter blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-52 h-52 bg-[#2c3e50]/5 rounded-tl-full filter blur-2xl pointer-events-none" />
          </motion.main>
        )}

        {/* -------------------------------------------------------------
            SCREEN VIEW 2: AUTH / SIGN IN & SIGN UP (Matching Slide 2 Extremely, LOCAL MODE!)
            ------------------------------------------------------------- */}
        {view === "login" && (
          <motion.main
            key="login-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full min-h-[90vh] flex flex-col items-center justify-center p-4 bg-[#f0f2f5]"
          >
            <div className="w-full max-w-[440px] flex flex-col gap-6">
              
              {/* Header section (Fidelity with slide 2 in high density style) */}
              <header className="text-center flex flex-col items-center gap-3">
                <div className="relative mb-2">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-200 group hover:scale-105 transition-transform duration-300">
                    <UtensilsCrossed className="text-[#2c3e50] w-8 h-8" />
                  </div>
                  {/* Subtle azure-blue spark badge */}
                  <div className="absolute -right-1 -bottom-1">
                    <Sparkles className="w-5 h-5 text-[#3498db] fill-[#3498db]/40" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Bienvenido a Menú Check
                </h2>
                <p className="text-gray-500 text-sm">
                  Tu organización familiar con frescura y orden
                </p>
              </header>

              {/* Login container box - High Density clean card design */}
              <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-5">
                
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  
                  {/* Email block */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="hola@familia.com"
                      className="w-full h-11 px-4 rounded-md border border-gray-300 bg-gray-50/50 focus:border-[#3498db] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm text-[1c1e21]"
                    />
                  </div>

                  {/* Password block */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Contraseña
                      </label>
                      <button 
                        type="button"
                        onClick={() => alert("Simulación: Enlace de recuperación enviado al correo local.")}
                        className="text-xs font-semibold text-[#3498db] hover:underline"
                      >
                        ¿Olvidaste la clave?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-4 rounded-md border border-gray-300 bg-gray-50/50 focus:border-[#3498db] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm text-[1c1e21]"
                    />
                  </div>

                  {/* Submit login */}
                  <button 
                    type="submit"
                    className="w-full h-11 mt-2 bg-[#2c3e50] hover:bg-[#34495e] text-white font-bold rounded-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    Iniciar Sesión (Modo Local)
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
                    O continúa con
                  </span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>

                {/* Social Login Options */}
                <div className="flex flex-col gap-3">
                  {/* Google Login Visual Bypass */}
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full h-11 bg-white border border-gray-300 text-gray-800 font-semibold text-sm rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Iniciar sesión con Google</span>
                  </button>

                  {/* Create Account styled crisp blue */}
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full h-11 bg-blue-50 hover:bg-blue-100 text-[#3498db] border border-blue-200 font-bold text-sm rounded-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear cuenta familiar</span>
                  </button>
                </div>
              </section>

              {/* Verified badge and footer */}
              <footer className="flex flex-col items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Protegido por almacenamiento local seguro</span>
                </div>
                <div className="flex items-center gap-3 font-bold text-[#3498db]">
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Enlace simulado de Términos"); }} className="hover:underline">Términos</a>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Enlace simulado de Privacidad"); }} className="hover:underline">Privacidad</a>
                </div>

                {/* Local Mode explanation footnote */}
                <div className="mt-2 flex flex-col items-center border border-gray-200 rounded-md p-3 bg-white text-center text-[10.5px] max-w-sm shadow-sm">
                  <p className="font-extrabold text-[#2c3e50] uppercase tracking-wider mb-1">Cero Dependencias Cloud</p>
                  <p className="text-gray-600 leading-normal">
                    Menú Check se ejecuta en <strong>modo 100% local</strong>. No enviamos datos a Firebase externas, almacenándose con seguridad directamente en la memoria local de tu navegador.
                  </p>
                </div>
              </footer>
            </div>
          </motion.main>
        )}

        {/* -------------------------------------------------------------
            AUTHENTICATED VIEW MAIN WRAPPER: DASHBOARD & LIST & CHAT
            ------------------------------------------------------------- */}
        {user.loggedIn && (view === "dashboard" || view === "shopping-list" || view === "assistant") && (
          <motion.div 
            key="dashboard-frame"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full min-h-screen flex flex-col md:flex-row bg-[#f0f2f5]"
          >
            {/* 1. DESKTOP NAVIGATION SIDEBAR (Matching Mock Slide 3 Sidebar exactly) */}
            <aside className="w-60 flex-shrink-0 hidden md:flex flex-col bg-[#2c3e50] border-r border-[#1a252f]">
              
              {/* Logo block */}
              <div className="p-6 border-b border-[#34495e]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#3498db] rounded flex items-center justify-center font-bold text-white shadow-inner">
                    MC
                  </div>
                  <div>
                    <h1 className="text-white font-semibold tracking-tight">
                      Menú Check
                    </h1>
                    <p className="text-[10px] uppercase text-[#7f8c8d] font-bold tracking-widest leading-none mt-1">
                      LOCAL MANAGER
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation links stack */}
              <nav className="flex-1 py-4 px-2 space-y-1">
                <div className="text-[10px] uppercase text-[#7f8c8d] font-bold px-4 mb-2 tracking-widest">Workspace</div>
                
                <button 
                  onClick={() => setView("shopping-list")}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-left text-sm transition-colors ${
                    view === "shopping-list" 
                      ? "bg-[#34495e] text-white font-medium shadow-sm" 
                      : "text-[#bdc3c7] hover:bg-[#34495e] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBasket className="w-4 h-4 flex-shrink-0" />
                    <span>Lista de Compra</span>
                  </div>
                  {shoppingList.filter(item => !item.checked).length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3498db] text-white">
                      {shoppingList.filter(item => !item.checked).length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => setView("dashboard")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left text-sm transition-colors ${
                    view === "dashboard" 
                      ? "bg-[#34495e] text-white font-medium shadow-sm" 
                      : "text-[#bdc3c7] hover:bg-[#34495e] hover:text-white"
                  }`}
                >
                  <ChefHat className="w-4 h-4 flex-shrink-0" />
                  <span>Recetario Semanal</span>
                </button>

                <button 
                  onClick={() => setView("assistant")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-left text-sm transition-colors ${
                    view === "assistant" 
                      ? "bg-[#34495e] text-white font-medium shadow-sm" 
                      : "text-[#bdc3c7] hover:bg-[#34495e] hover:text-white"
                  }`}
                >
                  <Bot className="w-4 h-4 flex-shrink-0" />
                  <span>Asistente IA Cocina</span>
                </button>
              </nav>

              {/* Simulated utility buttons block with User Account in navy-dark */}
              <div className="p-4 bg-[#1a252f] flex flex-col gap-3">
                
                {/* Active user credentials */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 border border-indigo-600 font-bold text-white text-xs flex items-center justify-center uppercase">
                    AC
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Ainhoa C.</p>
                    <p className="text-[10px] text-[#bdc3c7] truncate">Burriana Familia</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-[#34495e]">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[11px] text-[#bdc3c7]">Sincro Local: Activa</span>
                </div>

                <button 
                  onClick={() => alert("Menú Check se encuentra configurado en Modo Local sin base de datos externa.\nTus recetas y listas están sincronizadas offline en tu navegador actual.")}
                  className="w-full flex items-center gap-3 px-2 py-1 text-[11px] text-[#bdc3c7] hover:text-white hover:bg-[#34495e]/40 rounded text-left transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configuración</span>
                </button>

                <button 
                  onClick={handleLogOut}
                  className="w-full flex items-center gap-3 px-2 py-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </aside>

            {/* MOBILE NAVIGATION BAR (Matching mobile view layout exactly!) */}
            <div className="md:hidden bg-[#2c3e50] border-b border-[#1a252f] px-4 py-3 flex items-center justify-between sticky top-0 z-30 text-white">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#3498db] rounded flex items-center justify-center font-bold text-white text-xs">
                  MC
                </div>
                <span className="font-bold text-base text-white">Menú Check</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => alert("Notificaciones familiares: Sin novedades en el recetario el día de hoy.")}
                  className="relative p-1.5 hover:bg-[#34495e] rounded text-[#bdc3c7] hover:text-white"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleLogOut}
                  className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded"
                  title="Salir"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MAIN WORKING STREAM CANVAS */}
            <section className="flex-1 min-h-[90vh] flex flex-col p-4 md:p-8 lg:p-10 pb-28 md:pb-12 max-w-[1100px] mx-auto w-full">
              
              {/* TOP AD/PROMO COMMERCIAL VALUE BANNER (Fidelity with dashboard mock slides exactly!) */}
              <div className="mb-8 p-4 bg-[#fecbcb]/40 border border-[#fecbcb] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0px_4px_15px_rgba(61,103,81,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl text-[#7a5354]">
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#7a5354]">
                      Ofertas de comida de temporada
                    </h4>
                    <p className="text-xs text-[#7a5354]/90 mt-0.5">
                      Descuento del 15% en ingredientes de temporada en tu súper local favorito.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Simulacion: Abriendo folleto promocional de ofertas locales de temporada.")}
                  className="text-xs font-bold text-[#7a5354] underline hover:text-[#5e3f40] self-end sm:self-auto"
                >
                  Ver tiendas cercanas
                </button>
              </div>

              {/* -------------------------------------------------------------
                  SUBVIEW: DASHBOARD - RECETARIO SEMANAL
                  ------------------------------------------------------------- */}
              {view === "dashboard" && (
                <div className="space-y-6">
                  {/* Dashboard Header Title Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#2c3e50] tracking-tight">
                        Recetario Semanal
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Inspiración saludable para cocinar con tu familia con frescura y orden.
                      </p>
                    </div>

                    {/* Quick Category filter tabs list */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                      {["Todos", "Favoritos", "Desayuno", "Almuerzo", "Cena", "Saludable", "Confort"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                            activeCategoryFilter === cat
                              ? "bg-[#2c3e50] text-white shadow-sm"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search and Filters grid */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={recipeSearch}
                        onChange={(e) => setRecipeSearch(e.target.value)}
                        placeholder="Buscar por ingredientes o recetas (ej: aguacate, salmón, puerro, garbanzos...)"
                        className="w-full h-11 pl-10 pr-4 rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#3498db] transition-all outline-none text-sm text-[#1c1e21]"
                      />
                      {recipeSearch && (
                        <button 
                          onClick={() => setRecipeSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        setRecipeSearch("");
                        setActiveCategoryFilter("Todos");
                      }}
                      className="px-4 h-11 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span>Limpiar filtros</span>
                    </button>
                  </div>

                  {/* MENÚ DEL DÍA (DYNAMICS: CHANGES EVERY SINGLE DAY BASED ON DATE) */}
                  {recipeSearch === "" && activeCategoryFilter === "Todos" && dailyRecipes.length > 0 && (
                    <div className="bg-gradient-to-r from-teal-50/60 to-blue-50/60 border border-slate-200/90 rounded-2xl p-5 mb-2 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-gradient-to-br from-teal-400 to-[#3498db] rounded-xl text-white shadow-sm">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[#2c3e50] text-base flex items-center gap-1.5">
                              🍽️ Menú Recomendado para Hoy
                            </h3>
                            <p className="text-xs text-gray-600 font-medium">
                              {getFormattedTodayDate()} • Selección gastronómica diaria rotativa
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-200/80 text-slate-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#2c3e50]" />
                          Cambia cada 24 horas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dailyRecipes.map((recipe) => {
                          const isFav = favorites.includes(recipe.id);
                          return (
                            <div 
                              key={`daily-${recipe.id}`}
                              className="bg-white rounded-xl p-4 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 group relative shadow-xs"
                            >
                              {/* Top category label and absolute heart button */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                                  recipe.category === "Desayuno" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  recipe.category === "Almuerzo" ? "bg-slate-100 text-slate-850 border-slate-300" :
                                  recipe.category === "Cena" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                                  recipe.category === "Saludable" ? "bg-teal-50 text-teal-850 border-teal-200" :
                                  "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {recipe.category}
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(recipe.id);
                                  }}
                                  className="p-1.5 rounded-full hover:bg-rose-50 text-gray-300 hover:text-rose-500 transition-colors"
                                  title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
                                >
                                  <Heart className={`w-4.5 h-4.5 transition-all text-gray-400 ${isFav ? "fill-rose-500 text-rose-500 scale-110" : "hover:text-rose-500"}`} />
                                </button>
                              </div>

                              <div className="my-1">
                                <h4 className="font-bold text-sm text-[#2c3e50] group-hover:text-[#3498db] transition-colors line-clamp-1">
                                  {recipe.title}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-1 leading-relaxed">
                                  {recipe.description}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                                <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{recipe.time} min</span>
                                </span>
                                <button
                                  onClick={() => setSelectedRecipe(recipe)}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform"
                                >
                                  <span>Ver receta</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recipes Cards Grid Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.length > 0 ? (
                      filteredRecipes.map((recipe) => (
                        <motion.div
                          layout
                          key={recipe.id}
                          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 flex flex-col group hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Recipe dynamic image header wrapper */}
                          <div className="relative h-44 w-full bg-[#f3f4f5] overflow-hidden border-b border-gray-100">
                            {/* Category badge color mapper */}
                            <div className="absolute top-3 left-3 z-10">
                              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                                recipe.category === "Desayuno" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                recipe.category === "Almuerzo" ? "bg-slate-100 text-slate-800 border-slate-300" :
                                recipe.category === "Cena" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                                recipe.category === "Saludable" ? "bg-teal-50 text-teal-800 border-teal-200" :
                                "bg-amber-50 text-amber-800 border-amber-200"
                              }`}>
                                {recipe.category}
                              </span>
                            </div>

                            {/* Floating Favorite (Heart) Toggle Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(recipe.id);
                              }}
                              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-450 hover:text-rose-500 hover:scale-105 active:scale-95 shadow-sm transition-all"
                              title={favorites.includes(recipe.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                            >
                              <Heart 
                                className={`w-4 h-4 transition-all ${
                                  favorites.includes(recipe.id) ? "fill-rose-500 text-rose-500" : "text-gray-500 hover:text-rose-400"
                                }`} 
                              />
                            </button>

                            <img 
                              src={recipe.image} 
                              alt={recipe.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Body metadata */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-sm text-[#1c1e21] leading-snug group-hover:text-[#3498db] transition-colors line-clamp-1">
                                  {recipe.title}
                                </h3>
                                <div className="flex items-center gap-1 text-[#2c3e50] bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{recipe.stars}</span>
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                {recipe.description}
                              </p>
                            </div>

                            {/* Footer card row */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                              <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>{recipe.time} min</span>
                              </span>

                              <button 
                                onClick={() => setSelectedRecipe(recipe)}
                                className="px-3 py-1.5 bg-[#2c3e50] hover:bg-[#34495e] text-white rounded font-bold text-xs shadow-sm transition-colors"
                              >
                                Ver detalles
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      activeCategoryFilter === "Favoritos" ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white border border-[#c1c8c1]/30 rounded-2xl p-6 shadow-xs">
                          <div className="p-3.5 bg-rose-50 text-rose-500 rounded-full mb-3 animate-pulse">
                            <Heart className="w-8 h-8 fill-rose-400" />
                          </div>
                          <h4 className="font-bold text-base text-[#191c1d]">Tu lista de Favoritos está vacía</h4>
                          <p className="text-xs text-gray-500 max-w-sm mt-1.5 mb-5 leading-relaxed">
                            Guarda tus comidas preferidas pulsando el icono del corazón 🤍 en cualquiera de las tarjetas de recetas para verlas juntas aquí.
                          </p>
                          <button 
                            onClick={() => { setActiveCategoryFilter("Todos"); }}
                            className="px-5 py-2.5 bg-[#2c3e50] hover:bg-[#34495e] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
                          >
                            Explorar catálogo familiar
                          </button>
                        </div>
                      ) : (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white border border-[#c1c8c1]/30 rounded-2xl p-6">
                          <UtensilsCrossed className="w-12 h-12 text-[#414943]/40 mb-3" />
                          <h4 className="font-bold text-base text-[#191c1d]">No encontramos esa receta</h4>
                          <p className="text-xs text-[#414943] max-w-sm mt-1 mb-4">
                            Prueba a introducir otro ingrediente o palabra clave, o haz clic en &quot;Limpiar filtros&quot; para ver la lista inicial.
                          </p>
                          <button 
                            onClick={() => { setRecipeSearch(""); setActiveCategoryFilter("Todos"); }}
                            className="px-4 py-2 bg-[#2c3e50] text-white text-xs font-bold rounded-xl hover:bg-[#34495e]"
                          >
                            Mostrar todas las recetas
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* FLOATING MINI AI CHAT BUTTON & PROMPT FOR QUICK ACCESS IN RECIPES DASHBOARD */}
                  <div className="bg-slate-800 text-white rounded-lg p-6 shadow-sm border border-slate-700 mt-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-[#3498db]" />
                          <h4 className="font-bold text-base">¿Dudas con la cena de hoy?</h4>
                        </div>
                        <p className="text-xs text-gray-300 max-w-xl">
                          Pregunta a nuestro Asistente de Cocina IA. Analiza tu inventario local de forma rápida y te ayuda a planificar menús en segundos.
                        </p>
                      </div>
                      <button 
                        onClick={() => setView("assistant")}
                        className="px-5 py-2.5 bg-[#3498db] hover:bg-[#2980b9] text-white font-bold text-xs rounded-md transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
                      >
                        <span>Abrir Asistente IA</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SUBVIEW: SHOPPING LIST (Matching Slide 4 Beautifully!)
                  ------------------------------------------------------------- */}
              {view === "shopping-list" && (
                <div className="space-y-6">
                  
                  {/* Shopping list Layout Header */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#2c3e50]">
                      Lista de Compra
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Gestiona los ingredientes de tu menú familiar de forma ágil.
                    </p>
                  </div>

                  {/* 2-Column Responsive Layout: Shopping items (Col 1) and Pantry Stock (Col 2) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Shopping List Container (9 Columns on large screens) */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                      
                      {/* Subbar utility badges row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#3498db]/10 text-[#3498db] border border-blue-100/30 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
                            <ShoppingBasket className="w-3.5 h-3.5" />
                            <span>{shoppingList.length} artículos</span>
                          </span>
                          {shoppingList.some(i => i.checked) && (
                            <button 
                              onClick={handleClearCheckedItems}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 rounded-md text-xs font-bold transition-all"
                            >
                              Limpiar tachados
                            </button>
                          )}
                        </div>
                        
                        <span className="text-xs text-gray-500 font-semibold">
                          Guardado automático local
                        </span>
                      </div>

                      {/* Display Items Categories Blocks (Frutas y Verduras / Lácteos y Huevos / Otros) */}
                      {["Frutas y Verduras", "Lácteos y Huevos", "Otros"].map((categoryName) => {
                        const itemsInCategory = shoppingList.filter(item => item.category === categoryName);
                        
                        return (
                          <div 
                            key={categoryName}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                          >
                            {/* Color ribbon based on slide specs */}
                            <div className={`h-1.5 w-full ${
                              categoryName === "Frutas y Verduras" ? "bg-[#3498db]" :
                              categoryName === "Lácteos y Huevos" ? "bg-[#2c3e50]" : "bg-teal-500"
                            }`} />

                            {/* Header row */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-gray-50/50">
                              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                <span className="text-lg">
                                  {categoryName === "Frutas y Verduras" ? "🍎" : 
                                   categoryName === "Lácteos y Huevos" ? "🥛" : "📦"}
                                </span>
                                <span>{categoryName}</span>
                              </h3>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold border border-gray-300">
                                {itemsInCategory.length} ingrediente{itemsInCategory.length !== 1 && "s"}
                              </span>
                            </div>

                            {/* List stack */}
                            <div className="divide-y divide-gray-100">
                              {itemsInCategory.length > 0 ? (
                                itemsInCategory.map((item) => (
                                  <div 
                                    key={item.id}
                                    className={`p-4 flex items-center justify-between gap-4 group hover:bg-[#3498db]/5 transition-all ${
                                      item.checked ? "bg-gray-50 opacity-60" : ""
                                    }`}
                                  >
                                    <div className="flex items-center gap-3.5">
                                      {/* Rounded Checkbox */}
                                      <button 
                                        onClick={() => toggleItemChecked(item.id)}
                                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                                          item.checked 
                                            ? "bg-[#2c3e50] border-[#2c3e50] text-white" 
                                            : "border-gray-300 bg-white text-transparent hover:border-[#3498db]"
                                        }`}
                                      >
                                        <Check className="w-4.5 h-4.5 stroke-[3.5]" />
                                      </button>

                                      {/* Text block */}
                                      <div onClick={() => toggleItemChecked(item.id)} className="cursor-pointer">
                                        <p className={`text-sm font-semibold text-[#191c1d] ${
                                          item.checked ? "line-through text-gray-400" : ""
                                        }`}>
                                          {item.name}
                                        </p>
                                        <p className="text-[11px] text-[#414943]/80 font-medium">
                                          {item.quantity}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Action buttons (Delete) */}
                                    <button 
                                      onClick={() => deleteItem(item.id)}
                                      className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                      title="Eliminar artículo"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="p-4 text-xs italic text-[#414943] text-center">
                                  No hay artículos pendientes en esta categoría.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Sticky Input Add Form Block (Matching Slide 4 inputs) */}
                      <form 
                        onSubmit={handleAddCustomItem}
                        className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 items-center"
                      >
                        {/* Name input */}
                        <div className="flex-1 w-full">
                          <input 
                            type="text"
                            required
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Añadir producto a la lista (ej: Leche, Manzanas...)"
                            className="w-full bg-gray-50/50 border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#3498db] transition-all text-sm text-[#1c1e21]"
                          />
                        </div>

                        {/* Dropdown elements */}
                        <div className="flex gap-2 w-full sm:w-auto">
                          <select
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value as any)}
                            className="bg-gray-50/50 border border-gray-300 rounded-md px-3 py-2 text-xs text-[#1c1e21] focus:ring-2 focus:ring-blue-500/20 focus:border-[#3498db] font-bold outline-none flex-1 sm:flex-none"
                          >
                            <option value="Frutas y Verduras">Hortofruticultura</option>
                            <option value="Lácteos y Huevos">Lácteos & Huevos</option>
                            <option value="Otros">Abarrotes / Otros</option>
                          </select>

                          <input 
                            type="text"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                            placeholder="Cantidad"
                            className="w-20 bg-gray-50/50 border border-gray-300 rounded-md px-2 py-2 text-xs text-[#1c1e21] outline-none text-center font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-[#3498db]"
                          />

                          <button 
                            type="submit"
                            className="bg-[#2c3e50] hover:bg-[#34495e] text-white p-2.5 rounded-md transition-all flex items-center justify-center shadow-sm"
                            title="Insertar artículo"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* 2. MODO DESPENSA SIDEBAR PANE (3 Columns - Matching slide 4 right drawer completely!) */}
                    <aside className="lg:col-span-4 flex flex-col gap-6">
                      
                      {/* Modo Despensa container */}
                      <div className="bg-[#3498db]/5 p-5 rounded-lg border border-[#3498db]/20 flex flex-col gap-4">
                        
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-base text-[#2c3e50] flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            <span>Modo Despensa</span>
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          Visualiza los artículos que tienes en casa y que están próximos a agotarse. Añádelos a la lista antes de irte al supermercado.
                        </p>

                        {/* List of items */}
                        <div className="flex flex-col gap-3.5 mt-2">
                          {pantryItems.map((p) => (
                            <div 
                              key={p.id}
                              className="bg-white p-3 border border-gray-200 rounded-md flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-xl flex-shrink-0 border border-gray-200">
                                  {p.emoji}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-[#1c1e21] truncate">
                                    {p.name}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${p.percent <= 20 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                                    <span>{p.statusText}</span>
                                  </p>
                                </div>
                              </div>

                              {p.percent < 90 ? (
                                <button 
                                  onClick={() => addPantryItemToShoppingList(p.id, p.name)}
                                  disabled={p.addedToList}
                                  className={`p-2 rounded-md transition-all flex items-center justify-center border ${
                                    p.addedToList 
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                                      : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:scale-105"
                                  }`}
                                  title="Añadir directo a lista de compras"
                                >
                                  {p.addedToList ? (
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                  ) : (
                                    <ShoppingBasket className="w-4 h-4" />
                                  )}
                                </button>
                              ) : (
                                <span className="p-2 text-emerald-700 bg-emerald-50 rounded-lg">
                                  <Check className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Quick trigger dialog helper */}
                        <button 
                          onClick={() => alert("Inventario completo: Esta funcionalidad local se encuentra activa. Puedes editar el stock inicial de tus alimentos en Configuración.")}
                          className="w-full mt-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-[#2c3e50] text-xs font-bold rounded-md transition-colors shadow-sm"
                        >
                          Gestionar Alimentos
                        </button>
                      </div>

                      {/* Graphic Banner: Planea tu Menú - Evita el desperdicio (Slide 4 exact replacement) */}
                      <div className="relative rounded-lg overflow-hidden h-44 group bg-[#2c3e50] text-white shadow-sm border border-slate-700">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0Z5Froz7Ki2EuZkE0N2VlIeKkqEYE1y0xix11TnNFsDZVeaTI7AsUysq9SY7bGP4GBAYfec7Ck-0s-flL5PPmWLz_fSRicrFdx6sgYitSmiwXxeWG2nPyGe7aEhq1YZMcarv2zC1hnYuK1RaBXcmhx2QPvyBybgwRTHHeSGJQifVqIDg7IdwyRnXrgpw_x2mOK7QwAwJUCNVVDNS8QKUB79UavasZpEbztcnEKGOGhk8W_mZqUjOR0TugeZ7Ozt_z2jPIJ3DQYDGH" 
                          alt="Fresh biological vegetables basket" 
                          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#3498db] text-white px-2 py-0.5 rounded-full w-max mb-2">
                            Zero Waste
                          </span>
                          <h4 className="font-extrabold text-lg text-white">
                            Planea tu Menú
                          </h4>
                          <p className="text-xs text-white/90 font-medium mt-0.5">
                            Evita el desperdicio comprando solo lo necesario y ahorra hasta un 25%.
                          </p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SUBVIEW: FULL CHAT / ASISTENTE IA COCINA
                  ------------------------------------------------------------- */}
              {view === "assistant" && (
                <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[70vh]">
                  
                  {/* Chat header panel */}
                  <header className="p-4 md:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2c3e50] text-white flex items-center justify-center font-bold relative shadow-sm">
                        M
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                          <Check className="w-2.5 h-2.5 stroke-[4] text-white" />
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#191c1d] flex items-center gap-1.5">
                          <span>Asistente de Menú Familia</span>
                        </h3>
                        <p className="text-[11px] text-[#414943] font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Gemini 3.5 Flash Activo</span>
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setChatMessages([
                        {
                          id: makeUniqueId("m-reset"),
                          sender: "bot",
                          text: "He vaciado el historial de consulta. ¿Qué te gustaría que cocinemos para tu familia hoy?",
                          timestamp: new Date()
                        }
                      ])}
                      className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-md transition-all"
                    >
                      Limpiar chat
                    </button>
                  </header>

                  {/* Messages stream layout container */}
                  <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[50vh] space-y-4 custom-scrollbar">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-lg p-3.5 text-xs md:text-sm shadow-sm leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-[#2c3e50] text-white rounded-tr-none" 
                            : "bg-gray-50 border border-gray-200 text-[#1c1e21] rounded-tl-none"
                        }`}>
                          <p className="whitespace-pre-line font-medium">{msg.text}</p>
                          <span className={`block text-[9px] mt-2 text-right ${
                            msg.sender === "user" ? "text-white/70" : "text-gray-400"
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Typing state bubble */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg rounded-tl-none p-3.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Prompt Suggestions bubbles */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Sugerencias de Cocina Rápidas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "¿Qué hago para almorzar hoy?",
                        "Tengo tomates maduros y espinaca, sugerencias",
                        "Receta saludable de 15 minutos para niños",
                        "Tip de conservación para el aguacate"
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="bg-white hover:bg-blue-50/50 hover:border-[#3498db]/40 border border-gray-300 rounded-full px-3 py-1.5 text-xs text-gray-600 transition-all text-left"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input form panel code */}
                  <form 
                    onSubmit={handleSendChatMessage}
                    className="p-4 border-t border-gray-200 bg-white flex gap-2.5 items-center"
                  >
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Pregunta a la IA sobre recetas, ingredientes o planificación anti-desperdicios..."
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-4 py-2.5 text-xs md:text-sm outline-none text-[#1c1e21] focus:ring-2 focus:ring-blue-500/20 focus:border-[#3498db]"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2.5 bg-[#2c3e50] hover:bg-[#34495e] text-white rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </section>

            {/* MOBILE ONLY FLOATING ASSISTANT INPUT BAR OVERLAY ON RECIPES/LIST VIEWS (Slide 3 replica!) */}
            {view !== "assistant" && (
              <div className="fixed bottom-20 md:hidden left-4 right-4 z-40 bg-white/90 backdrop-blur-sm rounded-full p-2 border border-gray-200 flex items-center justify-between gap-3 shadow-md">
                <div 
                  onClick={() => setView("assistant")}
                  className="w-9 h-9 rounded-full bg-[#2c3e50] text-white flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                >
                  M
                </div>
                <input 
                  type="text"
                  onFocus={() => setView("assistant")}
                  placeholder="¿Qué cocinamos hoy? Pregunta a la IA..."
                  className="flex-1 bg-transparent border-none text-xs text-[#1c1e21] focus:ring-0 placeholder-gray-400 p-1"
                />
                <button 
                  onClick={() => setView("assistant")}
                  className="p-1.5 text-blue-500"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

            {/* MOBILE ONLY FOOTER NAVIGATION (Exactly like Slide 3 Bottom Bar!) */}
            <nav className="fixed bottom-0 left-0 right-0 py-2.5 px-4 bg-white border-t border-gray-200 flex justify-around items-center z-40 md:hidden shadow-sm">
              
              <button 
                onClick={() => setView("shopping-list")}
                className={`flex flex-col items-center justify-center gap-0.5 ${view === 'shopping-list' ? 'text-[#3498db]' : 'text-gray-400'}`}
              >
                <div className={`p-1 rounded-full ${view === 'shopping-list' ? 'bg-blue-50/50 text-[#3498db]' : ''}`}>
                  <ShoppingBasket className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Lista</span>
              </button>

              <button 
                onClick={() => setView("dashboard")}
                className={`flex flex-col items-center justify-center gap-0.5 ${view === 'dashboard' ? 'text-[#3498db]' : 'text-gray-400'}`}
              >
                <div className={`p-1 rounded-full ${view === 'dashboard' ? 'bg-blue-50/50 text-[#3498db]' : ''}`}>
                  <ChefHat className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Recetario</span>
              </button>

              <button 
                onClick={() => setView("assistant")}
                className={`flex flex-col items-center justify-center gap-0.5 relative ${view === 'assistant' ? 'text-[#3498db]' : 'text-gray-400'}`}
              >
                <div className={`p-1 rounded-full ${view === 'assistant' ? 'bg-blue-50/50 text-[#3498db]' : ''}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Asistente IA</span>
              </button>

              <button 
                onClick={() => {
                  alert("Modo Despensa: Para interactuar, vuelve a la pestaña 'Lista' y pulsa en los elementos rápidos del panel.");
                  setView("shopping-list");
                }}
                className="flex flex-col items-center justify-center gap-0.5 text-gray-400"
              >
                <div className="p-1 rounded-full">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Despensa</span>
              </button>
            </nav>

          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          SHARED DETAILED RECIPE DIALOG POPUP LAYER
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 shadow-xl relative border border-gray-200"
            >
              {/* Close Button badge */}
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 bg-white/80 p-2.5 rounded-full hover:bg-gray-50 shadow-sm z-10 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5 text-[#1c1e21]" />
              </button>

              {/* Recipe metadata picture row */}
              <div className="relative h-60 w-full rounded-md overflow-hidden mb-6 bg-gray-100">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                
                <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#3498db] text-white px-3 py-1 rounded-md">
                      {selectedRecipe.category}
                    </span>
                    <h3 className="text-2xl font-extrabold mt-2 leading-tight">
                      {selectedRecipe.title}
                    </h3>
                    <p className="text-xs text-white/90 font-medium mt-1">
                      {selectedRecipe.description}
                    </p>
                  </div>

                  {/* Speaker Button for full recipe, title and ingredients */}
                  <button
                    onClick={() => {
                      const fullReadText = `Receta de ${selectedRecipe.title}. Categoría ${selectedRecipe.category}. ${selectedRecipe.description}. Los ingredientes necesarios son: ${selectedRecipe.ingredients.join(", ")}.`;
                      speakText(fullReadText, -1);
                    }}
                    className={`p-3 rounded-full shadow-lg border backdrop-blur-md transition-all flex-shrink-0 ${
                      isSpeaking && speakingIndex === -1 
                        ? "bg-rose-500 border-rose-450 text-white animate-pulse" 
                        : "bg-white/20 hover:bg-white/35 border-white/30 text-white hover:scale-105 active:scale-95"
                    }`}
                    title={isSpeaking && speakingIndex === -1 ? "Detener lectura" : "Escuchar receta e ingredientes"}
                  >
                    {isSpeaking && speakingIndex === -1 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Grid Content splits */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed text-[#1c1e21]">
                
                {/* Ingredients block (5 columns) */}
                <div className="md:col-span-5 space-y-4">
                  <h4 className="font-bold text-sm text-[#2c3e50] uppercase tracking-wide border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <Apple className="w-4.5 h-4.5" />
                    <span>Ingredientes</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-xs font-semibold flex items-center gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Add all ingredients button helper */}
                  <button
                    onClick={() => {
                      // Mass add to list
                      const newItems = selectedRecipe.ingredients.map((ing, k) => ({
                        id: makeUniqueId(`ingredient-add-${k}`),
                        name: ing.replace(/^[\s\d\/.,\-\*]+(g|ml|taza|cda|cdita|rebanada|unidades|manojo|rodajas)?\s*(de\s*)?/i, ""), // simple strip of metrics
                        category: "Otros" as const,
                        quantity: ing.match(/^[\d\s\/.,gmltazcditreb\-\*a-z]+/i)?.[0] || "1 unidad",
                        checked: false
                      }));
                      setShoppingList(prev => [...prev, ...newItems]);
                      alert("¡Ingredientes añadidos con éxito a tu lista de compra!");
                      setSelectedRecipe(null);
                    }}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir ingredientes a la lista</span>
                  </button>
                </div>

                {/* Steps block (7 columns) */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="font-bold text-sm text-[#2c3e50] uppercase tracking-wide border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
                    <ChefHat className="w-4.5 h-4.5" />
                    <span>Pasos de Preparación</span>
                  </h4>
                  <ol className="space-y-3">
                    {selectedRecipe.steps.map((step, s) => {
                      const isReadingStep = isSpeaking && speakingIndex === s;
                      return (
                        <li 
                          key={s} 
                          className={`flex gap-3 text-xs md:text-[13px] leading-relaxed p-2 rounded-xl border transition-all ${
                            isReadingStep 
                              ? "bg-blue-50/70 border-blue-200 shadow-xs" 
                              : "border-transparent hover:bg-slate-50/60"
                          }`}
                        >
                          <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 transition-colors ${
                            isReadingStep ? "bg-blue-600 text-white" : "bg-[#2c3e50] text-white"
                          }`}>
                            {s+1}
                          </span>
                          <div className="flex-1">
                            <p className={`font-medium transition-colors ${isReadingStep ? "text-blue-900 font-semibold" : "text-[#414943]"}`}>
                              {step}
                            </p>
                          </div>
                          
                          {/* Mini speaker button for this step */}
                          <button
                            onClick={() => {
                              speakText(`Paso ${s+1}: ${step}`, s);
                            }}
                            className={`p-1.5 rounded-lg border transition-all self-center flex-shrink-0 ${
                              isReadingStep 
                                ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 scale-105 animate-pulse" 
                                : "bg-slate-50 hover:bg-slate-100 text-gray-500 border-slate-200 hover:text-[#3498db] active:scale-95"
                            }`}
                            title={isReadingStep ? "Detener lectura de este paso" : `Escuchar paso ${s+1}`}
                          >
                            {isReadingStep ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>

              </div>

              {/* Bottom bar */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Tiempo aproximado: {selectedRecipe.time} minutos</span>
                </span>
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="px-5 py-2 bg-[#2c3e50] hover:bg-[#34495e] text-white text-xs font-bold rounded-md"
                >
                  Cerrar
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate Modern Clean Page Footer block */}
      <footer className="py-6 border-t border-gray-200 mt-12 text-center text-xs text-gray-500 bg-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto px-4">
          <p className="font-medium">
            &copy; 2026 <strong>Menú Check</strong>. Organización familiar con frescura y orden.
          </p>
          <div className="flex gap-3 font-semibold text-blue-500">
            <span>Estilo High Density Slate</span>
            <span>&bull;</span>
            <span>Local Storage</span>
            <span>&bull;</span>
            <span>AI Cook Assist</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
