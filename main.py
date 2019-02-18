#!/usr/bin/env python3

from graphics import *
from constants import *
import os
import neat
#from itertools import izip
from Game import Game


class Counter:
    def __init__(self, initial):
        self.val = initial
    def decrease(self):
        self.val -= 1
alive_games = Counter(NUM_GAMES)
games = []


def eval_genomes(genomes, config):
    # Set up generation
    brains = []
    for genome_id, genome in genomes:
        brains.append([neat.nn.FeedForwardNetwork.create(genome, config), genome])
    for i in range(0, len(games)):
        games[i].set_brain(brains[i][0], brains[i][1])

    # Run generation
    for i in range(0, NUM_TURNS):
        for g in games:
            g.update()
        if alive_games.val <= 0:
            return
        update(FPS)


def setup_games(win):
    w = (WIN_SIZE.x - BUFFER * (NUM_COLS - 1)) / NUM_COLS
    h = (WIN_SIZE.y - BUFFER * (NUM_ROWS - 1)) / NUM_ROWS
    for i in range(0, NUM_ROWS):
        for j in range(0, NUM_COLS):
            games.append(Game(
                Point(j * (w + BUFFER), i * (h + BUFFER)),
                Point(w/SCALE, h/SCALE),
                win,
                alive_games
            ))
    print(w/SCALE, h/SCALE)


def main():
    win = GraphWin("Snake", WIN_SIZE.x, WIN_SIZE.y, autoflush=False)
    win.setBackground("grey")

    config = neat.Config(neat.DefaultGenome, neat.DefaultReproduction,
                         neat.DefaultSpeciesSet, neat.DefaultStagnation,
                         os.path.join(os.path.dirname(__file__), 'neat.config'))

    p = neat.Population(config)

    p.add_reporter(neat.StdOutReporter(True))
    stats = neat.StatisticsReporter()
    p.add_reporter(stats)
    p.add_reporter(neat.Checkpointer(5))

    setup_games(win)

    winner = p.run(eval_genomes, NUM_GENERATIONS)

    win.getMouse() # pause for click in window
    win.close()

main()
