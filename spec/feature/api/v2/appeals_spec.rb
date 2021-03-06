describe "Appeals API v2", type: :request do
  context "Appeal list" do
    before { FeatureToggle.enable!(:appeals_status) }

    let!(:original) do
      Generators::Appeal.create(
        vbms_id: "111223333S",
        vacols_record: {
          template: :remand_decided,
          type: "Original",
          status: "Complete",
          notification_date: Time.zone.today - 18.months,
          nod_date: Time.zone.today - 12.months,
          soc_date: Time.zone.today - 9.months,
          form9_date: Time.zone.today - 8.months,
          ssoc_dates: [Time.zone.today - 7.months],
          disposition: "Remanded",
          decision_date: Time.zone.today - 5.months
        }
      )
    end

    let!(:post_remand) do
      Generators::Appeal.create(
        vbms_id: "111223333S",
        vacols_record: {
          template: :ready_to_certify,
          type: "Post Remand",
          status: "Active",
          notification_date: Time.zone.today - 18.months,
          nod_date: Time.zone.today - 12.months,
          soc_date: Time.zone.today - 9.months,
          form9_date: Time.zone.today - 8.months,
          ssoc_dates: [
            Time.zone.today - 7.months,
            Time.zone.today - 4.months
          ],
          prior_decision_date: Time.zone.today - 5.months,
          disposition: nil,
          decision_date: nil
        }
      )
    end

    let!(:another_original) do
      Generators::Appeal.create(
        vbms_id: "111223333S",
        vacols_record: {
          template: :ready_to_certify,
          type: "Original",
          status: "Advance",
          notification_date: Time.zone.today - 12.months,
          nod_date: Time.zone.today - 6.months,
          soc_date: Time.zone.today - 5.days,
          form9_date: nil,
          disposition: nil,
          decision_date: nil
        }
      )
    end

    let!(:another_veteran_appeal) do
      Generators::Appeal.create(vbms_id: "333222333S")
    end

    let!(:held_hearing) do
      Generators::Hearing.create(
        appeal: original,
        date: 6.months.ago,
        disposition: :held
      )
    end

    let(:api_key) { ApiKey.create!(consumer_name: "Testington Roboterson") }

    it "returns 401 if API key not authorized" do
      headers = {
        "ssn": "111223333",
        "Authorization": "Token token=12312kdasdaskd"
      }

      get "/api/v2/appeals", nil, headers

      expect(response.code).to eq("401")
    end

    it "returns 422 if SSN is invalid" do
      headers = {
        "ssn": "11122333",
        "Authorization": "Token token=#{api_key.key_string}"
      }

      get "/api/v2/appeals", nil, headers

      expect(response.code).to eq("422")

      json = JSON.parse(response.body)
      expect(json["errors"].length).to eq(1)
      expect(json["errors"].first["title"]).to eq("Invalid SSN")
    end

    it "returns 404 if veteran with that SSN isn't found" do
      headers = {
        "ssn": "444444444",
        "Authorization": "Token token=#{api_key.key_string}"
      }

      get "/api/v2/appeals", nil, headers

      expect(response.code).to eq("404")

      json = JSON.parse(response.body)
      expect(json["errors"].length).to eq(1)
      expect(json["errors"].first["title"]).to eq("Veteran not found")
    end

    it "caches response" do
      headers = {
        "ssn": "111223333",
        "Authorization": "Token token=#{api_key.key_string}"
      }

      get "/api/v2/appeals", nil, headers
      json = JSON.parse(response.body)

      expect(json["data"].length).to eq(2)

      # Make a new appeal and check that it isn't returned because of the cache
      Generators::Appeal.create(
        vbms_id: "111223333S",
        vacols_record: { template: :remand_decided }
      )

      get "/api/v2/appeals", nil, headers
      json = JSON.parse(response.body)

      expect(json["data"].length).to eq(2)

      # tests that reload=true busts cache
      get "/api/v2/appeals?reload=true", nil, headers
      json = JSON.parse(response.body)

      expect(json["data"].length).to eq(3)
    end

    it "returns 500 on any other error" do
      headers = {
        "ssn": "444444444",
        "Authorization": "Token token=#{api_key.key_string}"
      }

      allow(ApiKey).to receive(:authorize).and_raise("Much random error")
      expect(Raven).to receive(:capture_exception)
      expect(Raven).to receive(:last_event_id).and_return("a1b2c3")

      get "/api/v2/appeals", nil, headers

      expect(response.code).to eq("500")

      json = JSON.parse(response.body)
      expect(json["errors"].length).to eq(1)
      expect(json["errors"].first["title"]).to eq("Unknown error occured")
      expect(json["errors"].first["detail"]).to match("Much random error (Sentry event id: a1b2c3)")
    end

    it "returns list of appeals for veteran with SSN" do
      headers = {
        "ssn": "111223333",
        "Authorization": "Token token=#{api_key.key_string}"
      }

      get "/api/v2/appeals", nil, headers

      json = JSON.parse(response.body)

      # test for the 200 status-code
      expect(response).to be_success

      # check to make sure the right amount of appeals are returned
      expect(json["data"].length).to eq(2)

      # check the attribtues on the first appeal
      expect(json["data"].first["attributes"]["type"]).to eq("post_remand")
      expect(json["data"].first["attributes"]["active"]).to eq(true)
      expect(json["data"].first["attributes"]["incompleteHistory"]).to eq(false)
      expect(json["data"].first["attributes"]["aod"]).to eq(true)
      expect(json["data"].first["attributes"]["location"]).to eq("bva")
      expect(json["data"].first["attributes"]["alerts"]).to eq([])

      # check the events on the first appeal are correct
      event_types = json["data"].first["attributes"]["events"].map { |e| e["type"] }
      expect(event_types).to eq(%w(claim_decision nod soc form9 ssoc hearing_held bva_decision ssoc))

      # check the status on the first appeal
      status = json["data"].first["attributes"]["status"]
      expect(status["type"]).to eq("decision_in_progress")
      expect(status["details"]["test"]).to eq("Hello World")

      # check the events on the last appeal are correct
      event_types = json["data"].last["attributes"]["events"].map { |e| e["type"] }
      expect(event_types).to eq(%w(claim_decision nod soc))

      # check for an alert on the last appeal
      expect(json["data"].last["attributes"]["alerts"].first["type"]).to eq("form9_needed")

      # check the status on the last appeal
      status = json["data"].last["attributes"]["status"]
      expect(status["type"]).to eq("pending_form9")

      # check that the date for the last event was formatted correctly
      json_notification_date = json["data"].last["attributes"]["events"].first["date"]
      expect(json_notification_date).to eq((Time.zone.today - 12.months).to_formatted_s(:csv_date))

      # check the other attribtues on the last appeal
      expect(json["data"].last["attributes"]["active"]).to eq(true)
      expect(json["data"].last["attributes"]["incompleteHistory"]).to eq(false)
      expect(json["data"].last["attributes"]["aod"]).to eq(true)
      expect(json["data"].last["attributes"]["location"]).to eq("aoj")

      # check stubbed attributes
      expect(json["data"].first["attributes"]["aoj"]).to eq("vba")
      expect(json["data"].first["attributes"]["programArea"]).to eq("compensation")
      expect(json["data"].first["attributes"]["description"]).to eq("")
      expect(json["data"].first["attributes"]["docket"]).to eq(nil)
      expect(json["data"].first["attributes"]["issues"]).to eq([])
      expect(json["data"].first["attributes"]["evidence"]).to eq([])
    end
  end
end
