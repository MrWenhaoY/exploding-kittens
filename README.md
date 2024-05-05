# Exploding Kittens (Bot & Algorithms)


## Exploding Kittens (Rules)

Exploding Kittens is like Russian Roulette, but more fun!

On each player's turn, they draw from the deck of cards. 
If they draw an **Exploding Kitten**, they explode and lose!
Otherwise, it is the next player's turn to draw!

To make things more fun, each card has a special ability!
Players may play any number of cards from their hand (including 0) before
drawing a card to end their turn.

Here, we have a subset of the cards from the actual *Exploding Kittens* game,
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

## Algorithm Design

