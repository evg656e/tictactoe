export const _ = 0;
export const X = 1;
export const O = 2;

export const markText = {
    [_]: ' ',
    [X]: 'X',
    [O]: 'O'
};

export const Player1 = 0;
export const Player2 = 1;
export const MaxPlayers = 2;

export function playerName(index) {
    if (index >= 0 && index < MaxPlayers)
        return 'Player ' + (index + 1);
    return '';
}

export function playerClass(index) {
    if (index >= 0 && index < MaxPlayers)
        return 'player' + (index + 1);
    return '';
};

// common predicates for findPlayer function
export function player1(player) {
    return player.index === Player1;
}

export function player2(player) {
    return player.index === Player2;
}

export function playerByIndex(index) {
    return function (player) {
        return player.index === index;
    };
}

export function thisPlayer(thisPlayer) {
    return function (otherPlayer) {
        return thisPlayer.equals(otherPlayer);
    };
}

export function otherPlayer(thisPlayer) {
    return function (otherPlayer) {
        return !thisPlayer.equals(otherPlayer);
    };
}

export const DiscardState = 0;
export const ProceedState = 1;
export const WinState = 2;
export const DrawState = 3;

export const WaitingForPlayersState = 0;
export const PlayersReadyState = 1;
export const MatchRunningState = 2;
export const MatchFinishedState = 3;

export const NotConnectedState = 0x0;
export const ConnectedState = 0x1;
export const FindingMatchState = 0x2;
export const GameRunningState = 0x4;

export const SoloMode = 0;
export const AiMode = 1;
export const MultiplayerMode = 2;

export const availableGameModes = [
    { text: 'Play Solo', value: SoloMode },
    { text: 'Play with Ai', value: AiMode },
    { text: 'Find other Player', value: MultiplayerMode }
];
