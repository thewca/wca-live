defmodule WcaLiveWeb.Schema.RecordTypes do
  use Absinthe.Schema.Notation

  alias WcaLiveWeb.Resolvers

  @desc "A virtual object representing a regional record entered within the platform."
  object :record do
    field :id, non_null(:id)
    field :type, non_null(:string)
    field :tag, non_null(:string)
    field :attempt_result, non_null(:integer)
    field :result, non_null(:result)
  end

  object :record_queries do
    field :recent_records, non_null(list_of(non_null(:record))) do
      resolve &Resolvers.Records.list_recent_records/3
    end
  end
end
