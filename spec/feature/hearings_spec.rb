require "rails_helper"

RSpec.feature "Hearings" do
  before do
    # Set the time zone to the current user's time zone for proper date conversion
    Time.zone = "America/New_York"
    Timecop.freeze(Time.utc(2017, 1, 1, 13))
  end

  let(:appeal) do
    Generators::Appeal.create
  end

  context "Hearings Prep" do
    let!(:current_user) do
      User.authenticate!(roles: ["Hearing Prep"])
    end

    before do
      2.times do |id|
        Generators::Hearing.create(
          id: id,
          user: current_user,
          appellant_first_name: "AppellantFirstName",
          appellant_last_name: "AppellantLastName",
          date: 5.days.from_now,
          type: "video",
          master_record: false
        )
      end

      Generators::Hearing.create(
        id: 3,
        user: current_user,
        type: "central_office",
        date: Time.zone.now,
        master_record: true
      )
    end

    scenario "Shows dockets for each day" do
      visit "/hearings/dockets"

      expect(page).to have_content("Upcoming Hearing Days")

      # Verify user
      expect(page).to have_content("VLJ: Lauren Roth")

      # Verify dates

      day1 = get_day(1)
      day2 = get_day(2)

      expect(day1 + 5.days).to eql(day2)

      # Verify docket types

      docket1_type = get_type(1)
      docket2_type = get_type(2)

      expect(docket1_type).to eql("CO")
      expect(docket2_type).to eql("Video")

      # Verify hearings count in each docket

      docket1_hearings = get_hearings(1)
      docket2_hearings = get_hearings(2)

      # the first one is a master record
      expect(docket1_hearings).to eql("0")
      expect(docket2_hearings).to eql("2")

      # Validate help link
      find('#menu-trigger').click
      find_link("Help").click
      expect(page).to have_content("Welcome to the Hearings Help page!")
    end

    scenario "Upcoming docket days correctly handles master records" do
      visit "/hearings/dockets"
      expect(page).to have_link(5.days.from_now.strftime("%-m/%-d/%Y"))
      expect(page).not_to have_link(Time.zone.now.strftime("%-m/%-d/%Y"))
    end

    scenario "Shows a daily docket" do
      visit "/hearings/dockets/2017-01-06"
      expect(page).to have_content("Daily Docket")
      expect(page).to have_content("1/6/2017")
      expect(page).to have_content("Hearing Type: Video")
      expect(page).to have_selector("tbody", 2)

      find_link("Back to Upcoming Hearing Days").click
      expect(page).to have_content("Upcoming Hearing Days")
    end

    scenario "Daily docket saves to the backend" do
      visit "/hearings/dockets/2017-01-01"
      fill_in "3.notes", with: "This is a note about the hearing!"
      fill_in "3.disposition", with: "No Show\n"
      fill_in "3.hold_open", with: "30 days\n"
      fill_in "3.aod", with: "Filed\n"
      find("label", text: "Transcript Requested").click

      visit "/hearings/dockets/2017-01-01"
      expect(page).to have_content("This is a note about the hearing!")
      expect(page).to have_content("No Show")
      expect(page).to have_content("30 days")
      expect(page).to have_content("Filed")
      expect(find_field("Transcript Requested", visible: false)).to be_checked
    end

    scenario "Link on daily docket opens worksheet in new tab" do
      visit "/hearings/dockets/2017-01-06"
      link = find(".cf-hearings-docket-appellant", match: :first).find("a")
      link_href = link[:href]

      link.click
      new_window = windows.last
      page.within_window new_window do
        visit link_href
        expect(page).to have_content("Hearing Worksheet")
      end
    end

    scenario "Hearing worksheet page displays worksheet information" do
      visit "/hearings/1/worksheet"
      expect(page).to have_content("Hearing Type: Video")
      expect(page).to have_content("Docket Number: 4198")
      expect(page).to have_content("Form 9: 12/21/2016")
      expect(page).to have_content("Army 02/13/2002 - 12/21/2003")
    end

    scenario "Worksheet saves on refresh" do
      visit "/hearings/1/worksheet"
      fill_in "Rep. Name:", with: "This is a rep name"
      fill_in "appellant-vet-witness", with: "This is a witness"
      fill_in "worksheet-contentions", with: "These are contentions"
      fill_in "worksheet-military-service", with: "This is military service"
      fill_in "worksheet-evidence", with: "This is evidence"
      fill_in "worksheet-comments-for-attorney", with: "These are comments"
      visit "/hearings/1/worksheet"
      expect(find_field("Rep. Name:").value).to eq "This is a rep name"
      expect(page).to have_content("This is a witness")
      expect(page).to have_content("These are contentions")
      expect(page).to have_content("This is military service")
      expect(page).to have_content("This is evidence")
      expect(page).to have_content("These are comments")

      visit "/hearings/1/worksheet/print?do_not_open_print_prompt=1"
      expect(page).to have_content("This is a rep name")
      expect(page).to have_content("This is a witness")
      expect(page).to have_content("These are contentions")
      expect(page).to have_content("This is military service")
      expect(page).to have_content("This is evidence")
      expect(page).to have_content("These are comments")
      expect(page.title).to eq "Hearing Worksheet for AppellantLastName, AppellantFirstName A."
    end

    scenario "Worksheet adds, deletes, edits, and saves user created issues" do
      visit "/hearings/1/worksheet"
      expect(page).to_not have_field("1-issue-program")
      expect(page).to_not have_field("1-issue-name")
      expect(page).to_not have_field("1-issue-levels")
      expect(page).to have_field("1-issue-description")

      click_on "button-addIssue-2"
      fill_in "2-issue-program", with: "This is the program"
      fill_in "2-issue-name", with: "This is the name"
      fill_in "2-issue-levels", with: "This is the level"
      fill_in "2-issue-description", with: "This is the description"

      find("#cf-issue-delete-21").click
      click_on "Confirm delete"
      expect(page).to_not have_content("Service Connection")

      visit "/hearings/1/worksheet"
      expect(page).to have_content("This is the program")
      expect(page).to have_content("This is the name")
      expect(page).to have_content("This is the level")
      expect(page).to have_content("This is the description")
      expect(page).to_not have_content("Service Connection")
    end

    context "Multiple appeal streams" do
      before do
        vbms_id = Hearing.find(1).appeal.vbms_id
        Generators::Appeal.create(vbms_id: vbms_id, vacols_record: { template: :pending_hearing })
      end

      scenario "Numbering is consistent" do
        visit "/hearings/1/worksheet"
        click_on "button-addIssue-2"
        expect(page).to have_content("3.")
        find("#cf-issue-delete-21").click
        click_on "Confirm delete"
        expect(page).to_not have_content("3.")
      end
    end

    scenario "Can click from hearing worksheet to reader" do
      visit "/hearings/1/worksheet"
      link = find("#review-efolder")
      link_href = link[:href]
      expect(page).to have_content("Review eFolder")
      click_on "Review eFolder"
      new_window = windows.last
      page.within_window new_window do
        visit link_href
        expect(page).to have_content("You've viewed 0 out of 4 documents")
      end
    end
  end
end

# helpers

def get_day(row)
  parts = find(:xpath, "//tbody/tr[#{row}]/td[1]").text.split("/").map(&:to_i)
  Date.new(parts[2], parts[0], parts[1])
end

def get_type(row)
  find(:xpath, "//tbody/tr[#{row}]/td[3]").text
end

def get_hearings(row)
  find(:xpath, "//tbody/tr[#{row}]/td[6]").text
end
