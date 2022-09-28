defmodule WcaLiveWeb.Schema.CompetitionsTypes do
  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers
  alias WcaLiveWeb.Resolvers

  object :competitions_queries do
    field :competitions, non_null(list_of(non_null(:competition))) do
      arg :limit, :integer
      arg :filter, :string
      arg :from, :date
      resolve &Resolvers.Competitions.list_competitions/3
    end

    field :competition, :competition do
      arg :id, non_null(:id)
      resolve &Resolvers.Competitions.get_competition/3
    end

    field :person, :person do
      arg :id, non_null(:id)
      resolve &Resolvers.Competitions.get_person/3
    end
  end

  @desc "A competition, imported from the WCA website."
  object :competition do
    field :id, non_null(:id)
    field :wca_id, non_null(:string)
    field :name, non_null(:string)
    field :short_name, non_null(:string)
    field :end_date, non_null(:date)
    field :start_date, non_null(:date)
    field :start_time, non_null(:datetime)
    field :end_time, non_null(:datetime)
    field :competitor_limit, :integer
    field :synchronized_at, non_null(:datetime)

    field :competition_events, non_null(list_of(non_null(:competition_event))) do
      resolve dataloader(:db,
                callback: fn competition_events, _parent, _args ->
                  {:ok,
                   Enum.sort_by(
                     competition_events,
                     &WcaLive.Wca.Event.get_rank_by_id!(&1.event_id)
                   )}
                end
              )
    end

    field :venues, non_null(list_of(non_null(:venue))) do
      resolve dataloader(:db)
    end

    field :competitors, non_null(list_of(non_null(:person))) do
      resolve dataloader(:db, :people, args: %{competitor: true})
    end

    field :staff_members, non_null(list_of(non_null(:staff_member))) do
      resolve dataloader(:db)
    end

    field :access, non_null(:competition_access) do
      resolve &Resolvers.Competitions.competition_access/3
    end

    field :podiums, non_null(list_of(non_null(:podium))) do
      resolve &Resolvers.Competitions.competition_podiums/3
    end
  end

  @desc "A competition event."
  object :competition_event do
    field :id, non_null(:id)
    field :competitor_limit, :integer

    field :event, non_null(:event) do
      resolve &Resolvers.Competitions.competition_event_event/3
    end

    field :rounds, non_null(list_of(non_null(:round))) do
      resolve dataloader(:db)
    end

    field :competition, non_null(:competition) do
      resolve dataloader(:db)
    end
  end

  @desc "A person relevant to a competition."
  object :person do
    field :id, non_null(:id)
    field :wca_user_id, non_null(:integer)
    field :wca_id, :string

    @desc "A small number, unique within the given competition, useful for scoretaking. " <>
            "Note: may be null for people who don't actually compete."
    field :registrant_id, :integer
    field :name, :string

    field :country, non_null(:country) do
      resolve &Resolvers.Competitions.person_country/3
    end

    field :avatar, :avatar do
      resolve &Resolvers.Competitions.person_avatar/3
    end

    field :roles, non_null(list_of(non_null(:string)))

    field :competition, non_null(:competition) do
      resolve dataloader(:db)
    end

    field :results, non_null(list_of(non_null(:result))) do
      resolve dataloader(:db)
    end

    field :assignments, non_null(list_of(non_null(:assignment))) do
      resolve dataloader(:db)
    end
  end

  @desc "An object representing person's assignment to an activity."
  object :assignment do
    field :id, non_null(:id)
    field :assignment_code, non_null(:string)
    field :station_number, :integer

    field :person, non_null(:person) do
      resolve dataloader(:db)
    end

    field :activity, non_null(:activity) do
      resolve dataloader(:db)
    end
  end

  @desc "A competition venue. Represents a physical location."
  object :venue do
    field :id, non_null(:id)
    field :wcif_id, non_null(:integer)
    field :name, non_null(:string)

    field :latitude, non_null(:float) do
      resolve &Resolvers.Competitions.venue_latitude/3
    end

    field :longitude, non_null(:float) do
      resolve &Resolvers.Competitions.venue_longitude/3
    end

    field :country, non_null(:country) do
      resolve &Resolvers.Competitions.venue_country/3
    end

    field :timezone, non_null(:string)

    field :rooms, non_null(list_of(non_null(:room))) do
      resolve dataloader(:db)
    end
  end

  @desc "A venue room. May represent a physical room or just a logical one (like a stage)."
  object :room do
    field :id, non_null(:id)
    field :wcif_id, non_null(:integer)
    field :name, non_null(:string)
    field :color, non_null(:string)

    field :activities, non_null(list_of(non_null(:activity))) do
      resolve dataloader(:db)
    end
  end

  @desc "An activity taking place in a specified timeframe in a single room."
  object :activity do
    field :id, non_null(:id)
    field :name, non_null(:string)
    field :wcif_id, non_null(:integer)
    field :activity_code, non_null(:string)
    field :start_time, non_null(:datetime)
    field :end_time, non_null(:datetime)

    field :child_activities, non_null(list_of(non_null(:activity))) do
      resolve dataloader(:db)
    end

    field :assignments, non_null(list_of(non_null(:assignment))) do
      resolve dataloader(:db)
    end

    @desc "The corresponding round for round activities, otherwise null."
    field :round, :round do
      resolve dataloader(:db)
    end
  end

  @desc "A virtual object representing a user being a part of competition staff."
  object :staff_member do
    field :id, non_null(:id)
    field :roles, non_null(list_of(non_null(:string)))

    field :user, non_null(:user) do
      resolve dataloader(:db)
    end

    field :competition, non_null(:competition) do
      resolve dataloader(:db)
    end
  end

  @desc "A virtual object representing current user access properties."
  object :competition_access do
    field :can_manage, non_null(:boolean)
    field :can_scoretake, non_null(:boolean)
  end

  @desc "An object representing a podium."
  object :podium do
    @desc "The corresponding final round."
    field :round, non_null(:round)

    @desc "Results on the podium."
    field :results, non_null(list_of(non_null(:result)))
  end
end
