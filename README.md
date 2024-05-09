# Exploding Kittens (Bot & Algorithms)

## Usage

You will need to start a server to be able to use this project. 
I used `python3 -m http.server 3000` to do so and accessed the website using `localhost:3000`.
Just opening the html file directly may not work as it could have problems loading the images.

Currently, `main.js` is set up run a game where `DP_20` (works with **Skips**, **Attacks**, and **Defuses** in deck)
is the first player (player 0) and the user is the second player.

`main.js` can be modified to run different bots with different deck compositions.
Change the class of `bot1` and `bot2` to change the bots that will be the first and second player.
A list of what each bot does is provided below.
The deck composition can also be modified. Change the numbers in the `deck` property of the object provided to the
`Game` constructor to modify the starting deck composition.

`runSim` can be uncommented and used to run large numbers of simulations of two bots against each other.
The results will be printed to the console in an array named `records`, where a 0 means that player0 won
and a 1 means that player1 won.

> ### Bots
> *Please note: Implicitly, all bots work with exactly 1 **Exploding Kitten** in deck, no more, no less.*
> *(So I will not explicitly mention below that all of the bots working with **Exploding Kittens**.)*
> 
> `Bots.User`: The user will be playing this position, not a bot. 
> This class allows for direct user input (click on a card to play it; click on the deck to draw).
>
> `DP_20Bot`: This bot plays optimally in games where the deck contains **Attacks**, **Skips**, and **Defuses**.
> The deck does not have to contain all those cards, but it cannot contain other types of cards (such as **Hairy Potato Cats**).
> 
> `Bots.NullBot`: This bot never plays cards and only draws.
> 
> `Bots.DumbBot`: This bot plays cards randomly. 
> It has an increasing higher chance of playing cards as the number of cards in the deck decrease.
> 
> `Bots.SkipBot`: This bot always **Skips** if it can. This bot is optimal when only **Skips** exist and **Defuses** do not.
> 
> `DP_13Bot`: This bot is optimal in games where only **Skips** exist in the deck, but players may start with **Defuses** in hand.
> 
> `DP_14Bot`: This bot is optimal when no types but **Skips** and **Defuses** exist in the deck. 
> All `DP` bots with a number greater than or equal to this can handle starting **Defuses** in hand.
> 
> `DP_30Bot`: This bot should play optimally in games where the deck contains 
> **Hairy Potato Cats**, **Attacks**, **Skips**, and **Defuses**.
> The deck does not have to contain all of these cards but cannot contain cards not listed.
> This bot has not be completely tested and debugged. It should work well enough but optimality is not 100% guaranteed.

## Exploding Kittens (Rules)

Exploding Kittens is like Russian Roulette, but more fun!

On each player's turn, they draw from the deck of cards. 
If they draw an **Exploding Kitten**, they explode and lose!
Otherwise, it is the next player's turn to draw!

To make things more fun, each card has a special ability!
Players may play any number of cards from their hand (including 0) before
drawing a card to end their turn.

Here, we restrict the game to just 2 players and a subset of the cards from the actual *Exploding Kittens* game,
some adjusted slightly.

> ### Defuse
> 
> When a player draws an **Exploding Kitten**, they may play a **Defuse** card to 
> shuffle the **Exploding Kitten** back into the deck instead of exploding.
>
> Their turn still ends, as they've drawn a card.
> 
> *In the actual* Exploding Kittens *game, players may choose where to place the **Exploding Kitten** in the deck,*
> *and the deck itself is not shuffled.*

> ### Skip
> 
> When a player plays a **Skip**, their turn ends immediately and they do not draw.

> ### Attack
> 
> When a player plays an **Attack**, they end their turn(s) immediately and the other player must take two turns in a row!
> 
> If a player has to take two turns in a row and play a **Skip**, that only skips one of their turns.
>
> However, playing an **Attack** allows the player to skip both of their turns. It's just that powerful!

> ### Exploding Kitten
>
> If you draw it, you explode! Unless you immediately **Defuse** it, in which case you don't.
> But there's only so many **Defuses** . . .

Although in the normal game players start with 1 **Defuse** and a certain number of cards from the deck,
here, we have each player start with just 1 **Defuse** in hand and no cards from the deck.

## Optimality

The algorithms here are designed to be optimal. In this context, we define optimal to be
minimax, or "highest lowest win rate". In other words, an optimal algorithm maximizes their
lowest possible win rate against all possible opponents.

While this means that the algorithm can never be exploited, it also means that the algorithm
is not as good at exploiting others. Against a particular given opponent, there may be better
strategies with higher win rates. However, against any opponent, an optimal algorithm provides
the best guarantee of minimum win rate.

Here, we define win rate as the "expected win rate" across a large number of games.
In other words, the same definition as expected value. Within a single game, the algorithm will
either win or lose. However, across a large number of games, it is expected that the algorithm
will win a proprotion of games equal to its win rate.

A caveat -- the algorithms here do not attempt to read their opponents 
and do not explicitly take into account how their actions may be read by opponents. 
By the definition of optimality, the algorithms should still provide the same minimum win rate,
although their exploitative powers may possibly have potential to be improved.

<!--*It is possible that for algorithms after `DP_20Bot` not reading or attempted reading
may be a known shortcoming *-->

## Algorithm Overview

Here, we will discuss the latest algorithm `DP_20Bot`. This algorithm is created for a game with only
**Skips**, **Attacks**, and **Defuses** in the deck (plus 1 **Exploding Kitten**).

This algorithm is optimal as defined above but does not attempt to read the opponent.

The algorithm uses dynamic programming to compute the best moves and expected win rates for each game state
(as defined by number of cards of each type in each player's hand and in deck, and remaining stacked turns
from a previously played **Attack**, if any).

Specifically, the algorithm uses memoization, and uses javascript objects to store the results.
For this algorithm, a number of these results have already been computed and are stored in `2.0-attack.json`
for faster loading.

The base case of the dynamic programming is with 1 card left in deck and no **Attacks**, **Skips**, and **Defuses** in hand.
In this case, the 1 card must be the **Exploding Kitten**, and since the player has no options to avoid it,
they must draw it and explode. Thus, the expected win rate is 0 and the move is `draw`.

The optimal choice given any game state is to make the choice with the highest expected win rate.

> `draw`: Given the number of each type of card in the deck, we can compute the chance of drawing each card.
> For each scenario, we now know what the next game state is.
> If it is the opponent's turn, the player's win rate in the scenario is `1 - the opponent's win rate in that game state playing optimally`.
> If it is still the player's turn, the player's win rate is just `win rate in that game state playing optimally`.
> In the scenario where the player drew an **Exploding Kitten**, 
> the win rate is `0` if the player does not have a **Defuse** 
> or, if the player does have a **Defuse**, 
> the win rate of the resulting game state where the player has 1 less **Defuse**. 
> The win rate of the `draw` option is the win rate for each scenario (possible card draw) 
> multiplied by the chance of that scenario occuring.

> `skip`: This option is only possible if the player has at least 1 **Skip** in hand. 
> If they do not, we denote this scenario being invalid by assigning it a win rate of `-1` so that it will never be picked.
> Should the player have a **Skip**, the proceeding game state is simply 
> the next player's turn where the current player has one less **Skip**.

> `attack`: This option is only possible if the player has at least 1 **Attack** in hand.
> If they do not, we denote this scenario being invalid by assigning it a win rate of `-1` so that it will never be picked.
> Should the player have an **Attack**, the proceeding game state is the opponent's turn, where they have to take 2 turns in a row
> and the player has one less **Attack**. The expected win rate for `attack` is 1 - the opponent's expected win rate in that scenario.

However, the algorithm does not know the entire game state at all points in the game.
It is known what cards each player starts out with, and the cards (and their quantities) in the deck.
The algorithm computes possibilities and their probabilities throughout the game and uses them
to decide how to act.

> If the opponent draws a card, there are probabilties for each card they could have drawn.
> Every time the opponent draws a card, the algorithm computes the distribution of possibilities
> of the resulting deck and opponent's hand.

> If the opponent plays a card, the algorithm has gained information.
> The algorithm discards all possibilities where the opponent did not have that card in their hand
> and reweights the new possibilities.
> Since the algorithm does not attempt to read the opponent, the algorithm simply evenly reweights
> all possibilties so that the probabilties add up to 1.
> The algorithm also adjusts the hand of the opponent in each of the remaining possibilities accordingly
> (removing 1 copy of the played card).

> When the algorithm draws a card, the algorithm has gained information.
> Given that the algorithm has drawn a specific card, the probabilities of each scenario change.
> For instance, if there were two possibilities of "2 skips in deck" and "1 skip, 1 attack in deck"
> and the algorithm drew a skip, then the algorithm knows that the former possibility was more likely.
> The algorithm reweights the probabilities of each possibility based on the card that it drew.
> (Part of the reweighting is discarding possibilities that are now known to be impossible.)
> The algorithm also adjusts the deck contents in each possibility according to the card it drew
> (removing 1 copy of the drawn card).

When it is the algorithm's turn, the algorithm calculates the expected value of each action by 
summing the product of the possibility of each game state and the expected win rate of the action
in that game state.
The algorithm then picks the action with the highest expected value and chooses that action.

> ### Runtime
> Since the algorithm effectively searches the game tree (for each possibility!), the runtime
> of the algorithm turns out to be exponential.
> 
> Consider a game with *n* cards in deck and *k* types of cards (excluding the **Exploding Kitten**,
> of which there is known to be exactly 1).
> 
> The dynamic programming portion of the algorithm takes in 1 parameter for # of cards in deck,
> 2 parameters for each type of card (# of that type in each player's hand),
> 1 parameter for each type of card - 1 (# of that type left in deck; last type can be calculated from the rest),
> and 1 additional parameter for # of turns in a row because of the **Attack** card.
> 
> Thus, the dynamic programming "array" (here the algorithm uses objects, but in a similar manner as arrays for DP)
> would have $1 + 2k + k - 1 + 1 = 3k + 1$ parameters, assuming that one of the card types is an **Attack**.
> 
> Assuming each player starts with 1 (or any constant number) **Defuse** in hand, 
> the maximum value of each parameter is $O(n)$ throughout the game.
> Assuming object access to be $O(1)$, computing a single game state value in the object is $O(1)$.
> There are $3k + 1$ parameters, each of which range from 0 or 1 to $O(n)$, so $O(n^{3k+1})$ values
> are computed in all for dynamic programming.
> 
> A deeper analysis, can be done however. Assuming that there are at most some fixed number of each type of card,
> which not unreasonable, a tighter upper bound can be established. In the actual *Exploding Kittens*,
> there are at most 5 of each type of card in the deck (in the base set, at least), and each player starts with 1
> **Defuse** in hand. Then, each of the $3k - 1$ parameters go from 0 to 5 (even for **Defuse** because only 2 start
> in the deck). The number of cards in the deck would be at most $n \leq 5k+1$, and number of consecutive turns is
> known to be either 0 or 1. Thus, there are actually only at most $5^{3k-1} \cdot (5k+1) \cdot 2 \approx k5^{3k}$ values in the
> dynamic programming array (object).
>
> Although both analyses yield exponential values, the runtime is still tolerable small values of $n$ and $k$, like the ones
> used for the current algorithm `DP_20`.
> 
> `DP_20` also tracks each possible game state and their associated probabilities throughout the game. The start state of the game
> is known and fixed, so at the beginning there is only 1 possible game state. However, each time the opponent draws a card,
> there are at most $k$ different types of cards they could have drawn (ignoring the **Exploding Kitten** because that is revealed
> and evident). Thus, the number of possible game states increases by at most a factor of $k$ each time a card is drawn.
> A loose upper bound would thus be $O(n^k)$ game states, although that is not entirely accurate because the number of game states
> decreases as cards are drawn by the algorithm or played in general and information is gained; at the end of the game, with 1 card
> left in the deck (should the game have not ended earlier), the number of possible game states has collapsed back into 1 as the
> contents of the deck and the opponent's hand are entirely known and certain.
> 
> Nevertheless, the number of tracked possibilities is still exponential throughout the game, although for the low values of $n$ and $k$
> used here, the runtime is still tolerable.
> 
> However, this does mean that new algorithms created with the current method that work with more types of cards will have
> exponentially greater runtime.