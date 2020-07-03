defmodule WcaLiveWeb.Schema do
  use Absinthe.Schema

  import_types Absinthe.Type.Custom
  import_types WcaLiveWeb.Schema.UserTypes

  query do
    import_fields :user_queries
  end
end
