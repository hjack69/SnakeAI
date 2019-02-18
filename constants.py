from graphics import Point

# Graphics options
WIN_SIZE = Point(1227, 612)
BUFFER = 3
NUM_COLS = 10
NUM_ROWS = 5
SCALE = 3
SCALE_V = Point(SCALE, SCALE)
FPS = 30

# Directions
UP = Point(0, -1)
DOWN = Point(0, 1)
LEFT = Point(-1, 0)
RIGHT = Point(1, 0)

# Genetic options
NUM_GENERATIONS = 50
NUM_GAMES = 50
NUM_TURNS = 500

# Scoring options
EAT_SCORE = 2
CLOSER_SCORE = 1
FURTHER_SCORE = -1.5
