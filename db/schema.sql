CREATE TABLE player_searches (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	player_name TEXT NOT NULL,
	searched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX player_searches_searched_at_idx ON player_searches (searched_at DESC);
