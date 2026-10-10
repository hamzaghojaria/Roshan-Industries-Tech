// Reviewed page and panel inventory of the 2026 high resolution source.
// Each row: retained SKU number (0 allocates a new SKU), category code, cleaned title.
export const categoryCodes = {
  E: 'eye-loupes',
  H: 'holders-stands',
  T: 'trays',
  R: 'covers',
  B: 'storage',
  G: 'gauges-selectors',
  L: 'link-strap-tools',
  W: 'tweezers',
  O: 'oiling-tools',
  J: 'jewellery-tools',
  S: 'soldering-tools',
  C: 'clock-parts',
  K: 'clock-keys',
  A: 'case-openers',
  D: 'screwdrivers',
  F: 'glass-hand-tools',
  P: 'compasses',
};
export const reviewedPages = {
  2: `1|E|Plastic Eye Glass with Golden Ring
2|E|Plastic Headband Eye Glass with Grey Ring
3|E|Plastic Headband Eye Glass with Green Ring
4|E|Plastic Silver Ring Eye Glass Number 1 to 1.5
5|E|Plastic Silver Ring Eye Glass Number 2 to 4.5
6|E|Aluminium Eye Glass Number 1 to 1.5
7|E|Aluminium Eye Glass Number 2 to 4.5
8|E|Plastic Bergon Shape Eye Glass Number 1 to 1.5
9|E|Plastic Bergon Shape Eye Glass Number 2 to 4.5
10|E|Plastic Anchor Shape Eye Glass Number 1 to 1.5
11|E|Plastic Anchor Shape Eye Glass Number 2 to 4.5
0|E|Plastic Sawing Eye Glass Set of 4`,
  3: `12|E|Plastic Spectacle Eye Glass Number 1 to 1.5
13|E|Plastic Spectacle Eye Glass Number 2 to 4.5
14|E|Plastic Headband Eye Glass Number 1 to 1.5
15|E|Plastic Headband Eye Glass Number 2 to 4.5
16|E|Plastic Sawing Eye Glass 10x
17|E|Plastic Sawing Eye Glass 7x
29|E|Stainless Steel Wire Hairband Eye Glass
19|E|Large Plastic Keychain Eye Glass
20|E|Small Plastic Keychain Eye Glass
21|H|Large Revolving Bur Stand
22|H|Single Step Poger Stand
23|H|Three Step Poger Stand`,
  4: `25|T|Plastic Dividing Tray
26|R|Single Dust Cover
27|R|Double Dust Cover
0|R|Dust Cover with Rubber Base
0|B|Plastic Storage Container for Watch Repair Parts
28|H|Movement Holder Set of 12
24|H|Acrylic Pliers Stand
0|H|Transparent Tool Stand
30|H|Movement Holder 10.5
31|H|Movement Holder for 2030 ST 96 Ladies Watches
32|L|Clips for Open Ended Watch Straps
33|G|Ring Gauge Stand Sizes 1 to 17`,
  5: `34|G|Large Matte Black Battery Selector
35|G|Small Square Battery Selector
36|G|Green Round Battery Selector
37|G|Round Battery Selector
38|G|Bangle Size Gauge
39|G|Round Side Bar Selector with Slotted Centre
200|G|Round Side Bar Selector with Solid Centre
40|G|Ring Gauge Set of 36
41|G|Side Bar and Strap Gauge
42|H|Bur Stand with 40 Holes
43|H|Bur Stand with 326 Holes
44|H|Complete Bur Stand Set with 326 Holes`,
  6: `45|W|Yellow Tweezer Set of 3
46|W|Large Tweezer 10 Inch
47|W|Medium Tweezer 7 Inch
48|W|Small Tweezer 6 Inch
49|W|Plastic Tweezer
50|W|Small Tweezer 5 Inch in Assorted Colours
51|O|Single Oil Pin
57|O|Oil Pin Set of 5
58|O|Oil Pin Set of 3
54|O|Small Oil Cup
55|O|Oil Cup and Oil Pin Set of 4
56|O|Single Oil Cup and Oil Pin Set`,
  7: `52|O|Three in One Oil Cup
53|O|Single Oil Cup
59|O|Wooden Oil Cup
192|T|Square Bench Tray
193|T|Round Bench Tray
60|J|Aluminium Work Holder with 60 Holes
61|S|Melting Disc with Wooden Handle 18 Inch
62|G|Black Laser Marked Ring Stick Sizes 1 to 36
63|G|Stepped Ring Stick with Base Sizes 4 to 13
64|G|Stepped Ring Stick without Base Sizes 4 to 13
65|G|Ring Stick Sizes 1 to 33
66|S|Ceramic Clamp with Base`,
  8: `67|S|Ceramic Clamp
68|S|Torch Stand with Six Hole Base
69|S|Ball Joint Third Hand with Base
70|S|Ball Joint Third Hand without Base
71|S|Fourth Hand with Base
72|S|Fourth Hand without Base
73|S|Large Ball Joint Third Hand
74|S|Third Hand Base
75|L|Multipurpose Link Remover
76|L|Large Link Remover 75 mm with Three Extra Pins
77|L|Adjustable Red Link Remover
78|L|Small Link Remover 25 mm with Three Extra Pins`,
  9: `79|L|Small Golden Link Remover
80|L|Horizontal Link Remover
81|L|Double Hand Link Remover
0|L|Plastic Link Remover
82|L|Red Link Remover Base with Pins
89|L|Red Square Plastic Pin Block
85|L|Screw Type Pin Removal Rod 7 mm with Three Pins
86|L|Plain Pin Removal Rod 7 mm with Three Pins
87|L|Replacement Pin Set of 3
88|L|Individual Replacement Pin
95|L|Link Remover Replacement Pins 0.8 and 1.0 mm
98|L|Link Remover Pins with Spring`,
  10: `90|C|GB Long Rod Set of 3
91|C|Round and Flat GB Long Rods
92|C|Double Ended GB Long Rod
93|C|Flat Type Round Clock Gong
94|C|Round Type Clock Gong
96|C|Brass Clock Hook
99|L|Square Delrin Block for Pin Removal
100|C|Ratchet Clip Set with Six Rivets
97|C|MS Clock Hook
104|C|Medium MS Clock Stabilizer
105|C|Large Brass Clock Stabilizer
101|C|Small MS Clock Stabilizer`,
  11: `102|C|MS Clock Cover 4.5 and 5.5 Inch
103|C|Brass Clock Cover 4.5 and 5.5 Inch
107|T|Diamond Tray
83|T|Triangular Aluminium Tray
84|T|White Plastic Tray
106|J|Small Novelty Shovel
108|J|Shovel with Handle
109|J|Chrome Plated Flat Shovel
152|S|Round Aluminium Revolving Soldering Holder
153|T|Rectangular Aluminium Tray
154|S|Solder Tray with Delrin Base 148 by 78 mm
0|A|Swatch Case Opener`,
  12: `110|J|File Holder with Wooden Handle
111|A|Case Opener Wrench with Wooden Handle
112|J|Blade Cutter with Wooden Handle
131|K|Brass Crank Key with Wooden Handle
134|K|Double Wing Round Novelty Clock Key
133|K|Single Wing Round Novelty Clock Key
128|K|Five in One Pocket Nickel Clock Key
117|K|Five in One Brass Clock Key
118|K|Small Four in One Brass Clock Key
119|K|Brass Clock Key Sizes 1.75 to 3.00
120|K|Brass Clock Key Sizes 3.25 to 3.75
121|K|Brass Clock Key Sizes 4.00 to 4.50`,
  13: `122|K|Brass Clock Key Sizes 4.75 to 5.25
123|K|Brass Clock Key Sizes 5.50 to 6.00
124|K|Brass Clock Key Sizes 6.25 to 6.75
125|K|Double Ended Nickel Clock Key
126|K|Single Ended Nickel Clock Key
116|K|Three Piece Key Set for Wooden Handle Box
132|K|Wire Crank Clock Key
127|K|Novelty Crank Clock Key
130|K|Double Ended MS Clock Key Set of 18
129|K|Double Ended Brass Clock Key Set of 18
135|A|Aluminium Knife Case Opener
136|A|Aluminium Knife Case Opener Replacement Blade`,
  14: `137|A|Case Back Opener Set of 4
138|A|Renata Type Case Back Opener
139|A|Original Model Case Back Opener
140|A|Knife Type Case Back Opener
141|A|MS Flat Case Opener with Screw and Knife
142|H|Aluminium Case Holder
143|H|Plastic Case Holder
144|L|Side Bar Opener
145|L|Blue Side Bar Remover
146|L|Side Bar and Pin Remover
0|L|Spring Bar Remover with Measuring Scale
147|L|MS Side Bar Remover`,
  15: `156|D|Nine Hole Screwdriver Stand with Screwdrivers
157|D|Revolving Screwdriver Stand with Eight Screwdrivers
0|D|Brass Revolving Screwdriver Stand with Screwdrivers
158|D|Wooden Screwdriver Stand with Five Screwdrivers
155|H|Revolving Screwdriver Stand without Tools
167|H|Seven Hole Aluminium Screwdriver Stand
175|H|Five Hole Aluminium Screwdriver Stand
159|D|Nine Piece Screwdriver Set with Stainless Steel Caps
160|D|Nine Piece Screwdriver Set with Aluminium Caps
0|D|Screwdriver Set in Wooden Box
161|D|Phillips Crosshead Screwdriver and Screw Remover
162|D|Slotted Head Screwdriver and Screw Remover`,
  16: `163|D|Screwdriver with Extra Grip
164|D|Screwdriver with Stainless Steel Cap
165|D|Screwdriver with Aluminium Cap
166|D|Screwdriver with Four Replacement Pins
173|L|Pin Holder 7 by 75 mm
189|L|Pin Pusher
194|F|Hand Presser Set of 4
195|F|Hand Fitting Tools
0|F|Hand Presser Set of 6
0|F|Revolving Hand Press
177|L|Hole Punch
178|L|Rolex Handle`,
  17: `113|L|MS Link Remover Pillar Set
114|L|Stainless Steel Link Remover Pillar Set
179|F|Silicone Casing Cushion
0|F|Silicone Cushions
174|H|Blue Aluminium Base
176|L|Watch Strap Holder
0|H|Aluminium Movement Holder
150|W|Cell Testing Tweezer 1.5 V
151|W|Cell Testing Tweezer 1.5 to 3 V
168|J|Acid Bottle
148|A|Rubber Case Back Opener with Wooden Handle
149|J|BA Spanner Set of 6`,
  18: `170|F|Original Model Glass Fitting Machine
169|F|Glass Fitting Machine Model A
0|F|Glass Fitting Machine Model B
171|F|Round and Square Delrin Fitting Bases
115|L|Delrin Belt Remover
172|F|Square Delrin Base Set of 6
182|C|Bopp Wire
183|H|Aluminium Screwdriver Stand
184|R|Lid Cover
185|C|MS Hook
186|J|Ring Clamp
190|G|Finger Gauge`,
  19: `187|G|Cell Tester
188|H|Tweezer Holder
191|L|Plastic Side Bar Remover
180|C|Dark Coiled Mainspring
181|C|Bronze Tone Coiled Mainspring
0|G|Watch Strap and Lug Measuring Tool
18|E|Auxiliary Eye Glass Lens
0|L|Brass Pin Pusher`,
  20: `199|P|Teardrop Qibla Compass
197|P|Round Hanging Qibla Compass
198|P|Roshan Industries Round Hanging Compass
196|P|Round Dial Qibla Compass`,
};
